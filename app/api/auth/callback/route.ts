import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForAccessToken } from '@/lib/instagram';
import { createSessionCookieValue, SESSION_COOKIE_NAME } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(errorDescription || error || 'Authorization was cancelled')}`, `${protocol}://${host}`)
    );
  }

  try {
    const tokenData = await exchangeCodeForAccessToken(code, redirectUri);
    
    // Create session cookie payload (valid for 60 days)
    const sessionPayload = {
      accessToken: tokenData.accessToken,
      user: {
        id: tokenData.userId,
        username: 'Connected Creator',
        connectedAt: new Date().toISOString(),
      },
      expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
    };

    const cookieValue = createSessionCookieValue(sessionPayload);
    
    const response = NextResponse.redirect(new URL('/?auth_success=true', `${protocol}://${host}`));
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('[ReelDrop] Auth exchange error:', err);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent('Failed to authenticate with Meta.')}`, `${protocol}://${host}`)
    );
  }
}
