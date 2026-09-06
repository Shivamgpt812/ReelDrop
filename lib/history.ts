import { MediaItem, MediaType } from './types';

export interface HistoryItem {
  id: string;
  shortcode: string;
  type: MediaType;
  username?: string;
  caption?: string;
  thumbnailUrl?: string;
  mediaUrl: string;
  downloadProxyUrl: string;
  timestamp?: string;
  savedAt: number;
}

const STORAGE_KEY = 'reeldrop_download_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (e) {
    console.error('Failed to read history from localStorage', e);
    return [];
  }
}

export function saveToHistory(media: MediaItem): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    // Filter out existing duplicate by shortcode
    const filtered = current.filter((item) => item.shortcode !== media.shortcode);
    
    const newItem: HistoryItem = {
      id: media.id || media.shortcode || Date.now().toString(),
      shortcode: media.shortcode,
      type: media.type,
      username: media.username,
      caption: media.caption,
      thumbnailUrl: media.thumbnailUrl,
      mediaUrl: media.mediaUrl,
      downloadProxyUrl: media.downloadProxyUrl,
      timestamp: media.timestamp,
      savedAt: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('reeldrop:history_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to save to history', e);
    return [];
  }
}

export function removeFromHistory(shortcode: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.shortcode !== shortcode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('reeldrop:history_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to remove from history', e);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('reeldrop:history_updated'));
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
