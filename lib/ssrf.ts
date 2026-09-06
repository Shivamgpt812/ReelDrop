/**
 * SSRF & Hostname Protection Layer for ReelDrop
 * Ensures that server-side fetch requests only connect to verified Meta/Instagram infrastructure
 * and never probe local network, cloud metadata, or private IP spaces.
 */

const ALLOWED_INSTAGRAM_HOSTNAMES = new Set([
  'instagram.com',
  'www.instagram.com',
  'instagr.am',
  'www.instagr.am',
  'graph.instagram.com',
  'graph.facebook.com',
  'api.instagram.com',
]);

const ALLOWED_CDN_SUFFIXES = [
  '.cdninstagram.com',
  '.fbcdn.net',
  '.instagram.com',
  '.rapidcdn.app',
  'commondatastorage.googleapis.com',
  'images.unsplash.com',
];

const BLOCKED_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^10\./,                          // RFC1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC1918 Class B
  /^192\.168\./,                    // RFC1918 Class C
  /^169\.254\./,                    // Link-local / Cloud Metadata (AWS, GCP, Azure)
  /^0\./,                           // Zero address
  /^::1$/,                          // IPv6 loopback
  /^fc00:/,                         // IPv6 Unique Local
  /^fe80:/,                         // IPv6 Link-Local
  /^localhost$/i,
];

/**
 * Validates whether a given URL is a legitimate Instagram frontend URL
 */
export function isValidInstagramDomain(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }

    return ALLOWED_INSTAGRAM_HOSTNAMES.has(hostname);
  } catch {
    return false;
  }
}

/**
 * Validates whether a media CDN URL is safe for server-side proxy downloading
 */
export function isSafeMediaCdnUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }

    if (ALLOWED_INSTAGRAM_HOSTNAMES.has(hostname)) {
      return true;
    }

    for (const suffix of ALLOWED_CDN_SUFFIXES) {
      if (hostname.endsWith(suffix) || hostname === suffix) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}
