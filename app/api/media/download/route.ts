import { NextRequest, NextResponse } from 'next/server';
import { isSafeMediaCdnUrl } from '@/lib/ssrf';
import { globalRateLimiter } from '@/lib/rate-limiter';
import https from 'https';

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
      hostname.includes('instagram.com')
    ) {
      return true;
    }
    return isSafeMediaCdnUrl(urlString);
  } catch {
    return false;
  }
}

/**
 * Downloads full binary chunks from upstream CDN stream
 */
async function fetchMediaStream(targetUrl: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const req = https.get({
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.instagram.com/',
        }
      }, (res) => {
        // Follow redirect if 301/302
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchMediaStream(res.headers.location).then(resolve);
          return;
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
          resolve(null);
        }
      });
      req.on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
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
    const format = searchParams.get('format') || 'mp4';
    const rawFilename = searchParams.get('filename') || `reeldrop_media.${format === 'mp3' ? 'mp3' : 'mp4'}`;
    const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!mediaUrl) {
      return new NextResponse('Missing media URL parameter', { status: 400 });
    }

    if (!isAllowedDownloadHost(mediaUrl)) {
      console.warn(`[ReelDrop SSRF Alert] Blocked suspicious media download URL: ${mediaUrl.slice(0, 50)}...`);
      return new NextResponse('Unauthorized or invalid media host.', { status: 403 });
    }

    // Retrieve real video/audio bytes directly from Instagram CDN
    const fetched = await fetchMediaStream(mediaUrl);

    if (fetched && fetched.buffer.length > 0) {
      const isMp3 = format === 'mp3' || cleanFilename.endsWith('.mp3');
      const contentType = isMp3 ? 'audio/mpeg' : fetched.contentType;

      const headers = new Headers();
      headers.set('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      headers.set('Content-Type', contentType);
      headers.set('Content-Length', String(fetched.buffer.length));
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');

      return new NextResponse(new Uint8Array(fetched.buffer), {
        status: 200,
        headers,
      });
    }

    // Direct redirect to CDN stream if buffering failed
    const redirectResponse = NextResponse.redirect(mediaUrl);
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return redirectResponse;
  } catch (error: any) {
    console.error('[ReelDrop] Error proxying media download:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
