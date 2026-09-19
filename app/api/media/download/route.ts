import { NextRequest, NextResponse } from 'next/server';
import { isSafeMediaCdnUrl } from '@/lib/ssrf';
import { globalRateLimiter } from '@/lib/rate-limiter';
import { processMediaWithFfmpeg } from '@/lib/media-processor';
import https from 'https';
import http from 'http';

export const dynamic = 'force-dynamic';

function isAllowedDownloadHost(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'commondatastorage.googleapis.com' ||
      hostname === 'images.unsplash.com' ||
      hostname.includes('cdninstagram.com') ||
      hostname.includes('fbcdn.net') ||
      hostname.includes('rapidcdn.app') ||
      hostname.includes('instagram.com') ||
      hostname.includes('snapsave.app')
    ) {
      return true;
    }
    return isSafeMediaCdnUrl(urlString);
  } catch {
    return false;
  }
}

/**
 * Downloads full binary chunks from upstream CDN stream with redirect and host header support
 */
async function fetchMediaStream(targetUrl: string, maxRedirects = 5): Promise<{ buffer: Buffer; contentType: string } | null> {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) return resolve(null);

    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;
      const host = parsed.hostname.toLowerCase();

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      if (host.includes('rapidcdn.app') || host.includes('snapsave')) {
        headers['Referer'] = 'https://snapsave.app/';
        headers['Origin'] = 'https://snapsave.app';
      } else if (host.includes('instagram.com') || host.includes('fbcdn.net')) {
        headers['Referer'] = 'https://www.instagram.com/';
      }

      const req = client.get({
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        rejectUnauthorized: false,
        headers,
      }, (res) => {
        // Handle Redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          try {
            const redirectUrl = new URL(res.headers.location, targetUrl).toString();
            fetchMediaStream(redirectUrl, maxRedirects - 1).then(resolve);
            return;
          } catch {
            return resolve(null);
          }
        }

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const contentType = res.headers['content-type'] || 'video/mp4';
            resolve({ buffer, contentType });
          });
          res.on('error', () => resolve(null));
        } else {
          // If first try failed with 403, retry without Referer
          if (headers['Referer']) {
            const cleanReq = client.get({
              hostname: parsed.hostname,
              port: parsed.port || (isHttps ? 443 : 80),
              path: parsed.pathname + parsed.search,
              rejectUnauthorized: false,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': '*/*',
              }
            }, (retryRes) => {
              if (retryRes.statusCode && retryRes.statusCode >= 200 && retryRes.statusCode < 400) {
                const chunks: Buffer[] = [];
                retryRes.on('data', (c) => chunks.push(Buffer.from(c)));
                retryRes.on('end', () => {
                  resolve({
                    buffer: Buffer.concat(chunks),
                    contentType: retryRes.headers['content-type'] || 'video/mp4',
                  });
                });
                retryRes.on('error', () => resolve(null));
              } else {
                resolve(null);
              }
            });
            cleanReq.on('error', () => resolve(null));
            return;
          }
          resolve(null);
        }
      });

      req.on('error', () => resolve(null));
      req.setTimeout(60000, () => {
        try { req.destroy(); } catch {}
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

export async function HEAD(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');
    if (!mediaUrl || !isAllowedDownloadHost(mediaUrl)) {
      return new NextResponse(null, { status: 400 });
    }

    const fetched = await fetchMediaStream(mediaUrl);
    if (fetched && fetched.buffer) {
      const headers = new Headers();
      headers.set('Content-Length', String(fetched.buffer.length));
      headers.set('Content-Type', fetched.contentType);
      return new NextResponse(null, { status: 200, headers });
    }
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = globalRateLimiter.check(clientIp);
    if (!rateLimit.allowed) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');
    const quality = searchParams.get('quality') || '1080p';
    const format = searchParams.get('format') || 'mp4';
    
    // Determine default file extension
    let defaultExt = 'mp4';
    if (format === 'mp3' || quality.startsWith('mp3')) defaultExt = 'mp3';
    else if (format === 'm4a' || quality === 'm4a') defaultExt = 'm4a';

    const rawFilename = searchParams.get('filename') || `reeldrop_${quality}.${defaultExt}`;
    let cleanFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Ensure correct extension on filename
    if (defaultExt === 'mp3' && !cleanFilename.endsWith('.mp3')) {
      cleanFilename = cleanFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.mp3';
    } else if (defaultExt === 'm4a' && !cleanFilename.endsWith('.m4a')) {
      cleanFilename = cleanFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.m4a';
    } else if (defaultExt === 'mp4' && !cleanFilename.endsWith('.mp4') && !cleanFilename.endsWith('.jpg')) {
      cleanFilename = cleanFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.mp4';
    }

    if (!mediaUrl) {
      return new NextResponse('Missing media URL parameter', { status: 400 });
    }

    if (!isAllowedDownloadHost(mediaUrl)) {
      console.warn(`[ReelDrop SSRF Alert] Blocked suspicious media download URL: ${mediaUrl.slice(0, 50)}...`);
      return new NextResponse('Unauthorized or invalid media host.', { status: 403 });
    }

    // Retrieve original video/media bytes directly from CDN
    const fetched = await fetchMediaStream(mediaUrl);

    if (fetched && fetched.buffer.length > 0) {
      // Process media with FFmpeg if resolution scaling, MB reduction compression, or audio extraction requested
      const processed = await processMediaWithFfmpeg(fetched.buffer, {
        quality,
        format,
      });

      const headers = new Headers();
      headers.set('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      headers.set('Content-Type', processed.contentType);
      headers.set('Content-Length', String(processed.buffer.length));
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');

      return new NextResponse(new Uint8Array(processed.buffer), {
        status: 200,
        headers,
      });
    }

    // Direct redirect to CDN stream ONLY for 1080p if buffering failed
    if (quality === '1080p' || quality === 'original') {
      const redirectResponse = NextResponse.redirect(mediaUrl);
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return redirectResponse;
    }

    return new NextResponse('Unable to transcode video from source stream.', { status: 502 });
  } catch (error: any) {
    console.error('[ReelDrop] Error proxying media download:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
