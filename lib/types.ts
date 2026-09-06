export type MediaType = 'reel' | 'post' | 'video' | 'tv' | 'carousel' | 'story';

export interface ParsedInstagramUrl {
  isValid: boolean;
  type?: MediaType;
  shortcode?: string;
  originalUrl: string;
  cleanUrl?: string;
  error?: string;
}

export interface MediaChild {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url: string;
  thumbnail_url?: string;
  download_url?: string;
}

export interface MediaItem {
  id: string;
  shortcode: string;
  type: MediaType;
  caption?: string;
  username?: string;
  timestamp?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  isOwnerAuthorized?: boolean;
  children?: MediaChild[];
  downloadProxyUrl: string;
  fileSizeBytes?: number;
  formattedSize?: string;
}

export interface ResolveMediaResponse {
  success: boolean;
  media?: MediaItem;
  error?: {
    code: 'INVALID_URL' | 'UNSUPPORTED_TYPE' | 'PRIVATE_OR_INACCESSIBLE' | 'AUTH_REQUIRED' | 'UNAUTHORIZED' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'NOT_FOUND';
    message: string;
    details?: string;
    requiresAuth?: boolean;
    loginUrl?: string;
  };
}

export interface InstagramAuthUser {
  id: string;
  username: string;
  accountType?: string;
  mediaCount?: number;
  connectedAt: string;
}
