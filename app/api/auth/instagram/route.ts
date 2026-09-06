import { NextRequest, NextResponse } from 'next/server';
import { getInstagramOAuthUrl } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;
  
  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = getInstagramOAuthUrl(redirectUri, state);
  return NextResponse.redirect(authUrl);
}
