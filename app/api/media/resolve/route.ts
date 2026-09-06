import { NextRequest, NextResponse } from 'next/server';
import { parseInstagramUrl, resolveInstagramMedia } from '@/lib/instagram';
import { globalRateLimiter } from '@/lib/rate-limiter';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Extract client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 2. Rate limiting check
    const rateLimit = globalRateLimiter.check(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please wait a moment before trying again.',
            details: `Rate limit exceeded. Reset in ${Math.ceil(rateLimit.resetMs / 1000)} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Please provide a valid Instagram URL.',
          },
        },
        { status: 400 }
      );
    }

    // 4. Sanitize and validate Instagram URL
    const parsed = parseInstagramUrl(rawUrl);
    if (!parsed.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: parsed.error || 'Invalid Instagram URL provided.',
          },
        },
        { status: 400 }
      );
    }

    // 5. Check user session for authenticated token
    const session = getSession();
    const userToken = session?.accessToken;

    // 6. Log sanitized request securely (never log tokens)
    console.log(`[ReelDrop] Resolving ${parsed.type?.toUpperCase()} shortcode: ${parsed.shortcode} from IP: ${clientIp.slice(0, 7)}***`);

    // 7. Resolve media object via official Meta Graph API or authorized session
    const resolution = await resolveInstagramMedia(parsed, userToken);

    if (!resolution.success) {
      const statusCode = resolution.error?.code === 'AUTH_REQUIRED' ? 401 : resolution.error?.code === 'UNAUTHORIZED' ? 403 : 400;
      return NextResponse.json(resolution, { status: statusCode });
    }

    return NextResponse.json(resolution, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error: any) {
    console.error('[ReelDrop] Unhandled error in /api/media/resolve:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected server error occurred while processing your request.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
}
