'use client';

import React, { useState, useEffect } from 'react';
import { 
  HistoryItem, 
  getHistory, 
  removeFromHistory, 
  clearHistory 
} from '@/lib/history';
import { 
  History, 
  Download, 
  Music, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Film, 
  Image as ImageIcon,
  Check,
  Copy,
  Clock,
  Sparkles
} from 'lucide-react';
import { extractPureAudioBlob } from '@/lib/audio-converter';

interface HistoryTrayProps {
  onSelectItem?: (mediaUrl: string) => void;
}

function timeAgo(dateMs: number): string {
  const seconds = Math.floor((Date.now() - dateMs) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryTray({ onSelectItem }: HistoryTrayProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingAudioId, setProcessingAudioId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    setHistory(getHistory());

    const handleUpdate = () => {
      setHistory(getHistory());
    };

    window.addEventListener('reeldrop:history_updated', handleUpdate);
    return () => {
      window.removeEventListener('reeldrop:history_updated', handleUpdate);
    };
  }, []);

  const handleCopyLink = (shortcode: string) => {
    const instagramUrl = `https://www.instagram.com/reel/${shortcode}/`;
    navigator.clipboard.writeText(instagramUrl);
    setCopiedId(shortcode);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadVideo = (item: HistoryItem) => {
    const isVideo = item.type === 'reel' || item.type === 'video' || item.type === 'tv';
    const a = document.createElement('a');
    a.href = item.downloadProxyUrl || item.mediaUrl;
    a.download = `reeldrop_${item.type}_${item.shortcode}.${isVideo ? 'mp4' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAudio = async (item: HistoryItem) => {
    setProcessingAudioId(item.shortcode);
    try {
      const audioBlob = await extractPureAudioBlob(item.downloadProxyUrl || item.mediaUrl);
      const audioUrl = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `reeldrop_audio_${item.shortcode}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(audioUrl);
        setProcessingAudioId(null);
      }, 2000);
    } catch (err) {
      console.warn('Audio fallback for history item', err);
      const fallbackUrl = `/api/media/download?url=${encodeURIComponent(item.mediaUrl)}&format=mp3&filename=reeldrop_audio_${item.shortcode}.mp3`;
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.download = `reeldrop_audio_${item.shortcode}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setProcessingAudioId(null);
    }
  };

  const handleRemove = (e: React.MouseEvent, shortcode: string) => {
    e.stopPropagation();
    removeFromHistory(shortcode);
  };

  const handleClearAll = () => {
    clearHistory();
    setShowConfirmClear(false);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Recent Downloads
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {history.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Saved privately on your device only</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {showConfirmClear ? (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-xl border border-rose-200 dark:border-rose-900">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 px-2">Clear all?</span>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              title="Clear all download history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Download History Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => {
          const isVideo = item.type === 'reel' || item.type === 'video' || item.type === 'tv';
          return (
            <div
              key={item.shortcode}
              className="group relative glass-card rounded-2xl p-3.5 flex flex-col justify-between transition-all hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              {/* Top Row: Thumbnail + Info */}
              <div className="flex gap-3">
                
                {/* Thumbnail */}
                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-black/50 flex-shrink-0 border border-zinc-200/60 dark:border-zinc-800">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.caption || 'Downloaded Reel'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  
                  {/* Format tag */}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold uppercase backdrop-blur-xs">
                    {item.type}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        @{item.username || 'instagram_user'}
                      </span>
                      <button
                        onClick={(e) => handleRemove(e, item.shortcode)}
                        className="text-zinc-400 hover:text-rose-500 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-snug">
                      {item.caption || 'Instagram Reel Video'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(item.savedAt)}</span>
                  </div>
                </div>

              </div>

              {/* Bottom Row: Quick Actions */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                {/* Re-download Video */}
                <button
                  onClick={() => handleDownloadVideo(item)}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1 transition-colors shadow-sm"
                  title="Download MP4 Video"
                >
                  <Download className="w-3 h-3" />
                  <span>MP4</span>
                </button>

                {/* Extract Pure Audio */}
                {isVideo ? (
                  <button
                    onClick={() => handleDownloadAudio(item)}
                    disabled={processingAudioId === item.shortcode}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center gap-1 transition-colors"
                    title="Extract Pure Audio MP3"
                  >
                    <Music className={`w-3 h-3 text-purple-500 ${processingAudioId === item.shortcode ? 'animate-spin' : ''}`} />
                    <span>MP3</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadVideo(item)}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>JPG</span>
                  </button>
                )}

                {/* Copy Link */}
                <button
                  onClick={() => handleCopyLink(item.shortcode)}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
                  title="Copy Instagram Reel Link"
                >
                  {copiedId === item.shortcode ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                  <span>{copiedId === item.shortcode ? 'Copied' : 'Link'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
