import { cookies } from 'next/headers';
import { InstagramAuthUser } from './types';

const SESSION_COOKIE_NAME = 'reeldrop_ig_session';

export interface UserSession {
  accessToken: string;
  user: InstagramAuthUser;
  expiresAt: number;
}

/**
 * Basic session encoding/decoding helper
 */
export function getSession(): UserSession | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }

    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session: UserSession = JSON.parse(decoded);

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function createSessionCookieValue(session: UserSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export { SESSION_COOKIE_NAME };
