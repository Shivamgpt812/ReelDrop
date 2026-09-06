'use client';

import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/lib/types';
import { 
  Download, 
  Share2, 
  Check, 
  Sparkles, 
  RefreshCw, 
  FileVideo, 
  Image as ImageIcon, 
  UserCheck, 
  Calendar, 
  QrCode, 
  Music,
  Headphones,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import QrModal from './QrModal';
import { extractPureAudioBlob } from '@/lib/audio-converter';
import { saveToHistory } from '@/lib/history';

interface MediaPreviewProps {
  media: MediaItem;
  onReset: () => void;
}

export default function MediaPreview({ media, onReset }: MediaPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Automatically save to local history when previewed
  useEffect(() => {
    if (media) {
      saveToHistory(media);
    }
  }, [media]);

  const isVideo = media.type === 'reel' || media.type === 'video' || media.type === 'tv';
  const hasCarousel = media.children && media.children.length > 0;
  
  const currentMediaUrl = hasCarousel
    ? media.children![activeSlideIndex].media_url
    : media.mediaUrl;

  const currentDownloadUrl = hasCarousel
    ? media.children![activeSlideIndex].download_url || media.downloadProxyUrl
    : media.downloadProxyUrl;

  const currentIsVideo = hasCarousel
    ? media.children![activeSlideIndex].media_type === 'VIDEO'
    : isVideo;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `?reel=${media.shortcode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVideo = () => {
    setIsDownloadingVideo(true);
    saveToHistory(media);
    const a = document.createElement('a');
    a.href = currentDownloadUrl;
    a.download = `reeldrop_${media.type}_${media.shortcode}.${currentIsVideo ? 'mp4' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => setIsDownloadingVideo(false), 2500);
  };

  const handleDownloadAudio = async () => {
    setIsDownloadingAudio(true);
    try {
      // Extract genuine pure audio stream (stripping all video tracks)
      const audioBlob = await extractPureAudioBlob(currentDownloadUrl);
      const audioUrl = URL.createObjectURL(audioBlob);

      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `reeldrop_audio_${media.shortcode}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(audioUrl);
        setIsDownloadingAudio(false);
      }, 2000);
    } catch (err) {
      console.warn('Audio decoding fallback:', err);
      // Fallback to server download route
      const fallbackUrl = `/api/media/download?url=${encodeURIComponent(currentMediaUrl)}&format=mp3&filename=reeldrop_audio_${media.shortcode}.mp3`;
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.download = `reeldrop_audio_${media.shortcode}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsDownloadingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-6 duration-400">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Ready to Download
          </span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Download Another Link</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 border border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Left Column: Media Player / Preview */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[340px] aspect-[9/16] max-h-[520px] rounded-2xl overflow-hidden bg-black shadow-xl border border-zinc-800 flex items-center justify-center group">
            
            {currentIsVideo ? (
              <video
                src={currentMediaUrl}
                poster={media.thumbnailUrl}
                controls
                playsInline
                autoPlay
                muted
                loop
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={currentMediaUrl}
                alt={media.caption || 'Instagram Post'}
                className="w-full h-full object-contain"
              />
            )}

            {/* Format pill overlay */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 pointer-events-none">
              {currentIsVideo ? (
                <FileVideo className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="uppercase">{media.type} • {currentIsVideo ? '1080p MP4' : 'HD JPG'}</span>
            </div>

            {/* Quality badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] font-medium flex items-center gap-1 pointer-events-none">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Original HD</span>
            </div>
          </div>

          {/* Carousel thumbnails selector if album */}
          {hasCarousel && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto py-2 max-w-full">
              {media.children!.map((child, index) => (
                <button
                  key={child.id}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeSlideIndex === index
                      ? 'border-rose-500 scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={child.thumbnail_url || child.media_url}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/70 text-white px-1 rounded font-bold">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Download Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            {/* Creator profile & tag */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                  <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center font-bold text-rose-500 text-sm">
                    {media.username ? media.username.charAt(0).toUpperCase() : 'I'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      @{media.username || 'instagram_user'}
                    </span>
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(media.timestamp || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  {media.formattedSize || 'HD 1080p'}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase">
                  No Watermark
                </span>
              </div>
            </div>

            {/* Caption */}
            {media.caption && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {showFullCaption || media.caption.length <= 140
                    ? media.caption
                    : `${media.caption.slice(0, 140)}...`}
                </p>
                {media.caption.length > 140 && (
                  <button
                    onClick={() => setShowFullCaption(!showFullCaption)}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 mt-1"
                  >
                    {showFullCaption ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Spec breakdown badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Resolution</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">1080p Full HD</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Audio Track</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">Pure MP3 Audio</span>
              </div>
            </div>

          </div>

          {/* Download Action Area */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            
            {/* Primary Download Video Button */}
            <button
              onClick={handleDownloadVideo}
              disabled={isDownloadingVideo}
              className="w-full py-4 px-6 rounded-2xl btn-gradient font-bold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-rose-500/25 cursor-pointer disabled:opacity-80"
            >
              <Download className={`w-5 h-5 ${isDownloadingVideo ? 'animate-bounce' : ''}`} />
              <span>
                {isDownloadingVideo
                  ? 'Downloading Video...'
                  : currentIsVideo
                  ? 'Download Video (HD MP4)'
                  : 'Download HD Image'}
              </span>
            </button>

            {/* Extract & Download Pure Audio (MP3) Button */}
            {currentIsVideo && (
              <button
                onClick={handleDownloadAudio}
                disabled={isDownloadingAudio}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Music className={`w-4 h-4 text-purple-500 ${isDownloadingAudio ? 'animate-spin' : ''}`} />
                <span>
                  {isDownloadingAudio ? 'Extracting Pure Audio (No Video)...' : 'Extract & Download Audio (MP3)'}
                </span>
              </button>
            )}

            {/* Scan to Phone Button */}
            <button
              onClick={() => setIsQrOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-500" />
              <span>Scan QR Code to Phone</span>
            </button>

            {/* Secondary actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={onReset}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Link</span>
              </button>
            </div>

            {/* Trust note */}
            <div className="text-center pt-1">
              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>100% Free • No Ads • No Watermark</span>
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Phone Transfer Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        downloadUrl={currentDownloadUrl}
        directMediaUrl={currentMediaUrl}
        shortcode={media.shortcode}
      />

    </div>
  );
}
