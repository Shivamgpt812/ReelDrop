'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem, QualityOption, MediaFormat } from '@/lib/types';
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
  CheckCircle2,
  SlidersHorizontal,
  HardDrive,
  Zap,
  ArrowDownCircle,
  Headphones
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedQualityId, setSelectedQualityId] = useState<string>('720p');

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

  const currentIsVideo = hasCarousel
    ? media.children![activeSlideIndex].media_type === 'VIDEO'
    : isVideo;

  const [duration, setDuration] = useState<number>(media.duration || 15);
  const [detectedBytes, setDetectedBytes] = useState<number | null>(media.fileSizeBytes || null);

  // Probe exact content-length on mount if not already present
  useEffect(() => {
    if (media.fileSizeBytes) {
      setDetectedBytes(media.fileSizeBytes);
      return;
    }
    fetch(`/api/media/download?url=${encodeURIComponent(currentMediaUrl)}`, { method: 'HEAD' })
      .then((res) => {
        const cl = res.headers.get('content-length');
        if (cl) {
          const bytes = parseInt(cl, 10);
          if (!isNaN(bytes) && bytes > 0) {
            setDetectedBytes(bytes);
          }
        }
      })
      .catch(() => {});
  }, [currentMediaUrl, media.fileSizeBytes]);

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
      setDuration(Math.round(vid.duration));
    }
  };

  // Base MB calculation
  const baseMb = useMemo(() => {
    if (detectedBytes && detectedBytes > 0) {
      return detectedBytes / (1024 * 1024);
    }
    if (media.fileSizeBytes && media.fileSizeBytes > 0) {
      return media.fileSizeBytes / (1024 * 1024);
    }
    if (media.formattedSize && !isNaN(parseFloat(media.formattedSize))) {
      const parsed = parseFloat(media.formattedSize);
      if (parsed > 0) return parsed;
    }
    // Dynamic estimate based on exact video duration
    return Math.max(1.2, (duration * 3.2) / 8);
  }, [detectedBytes, media.fileSizeBytes, media.formattedSize, duration]);

  const formatted1080p = baseMb >= 1 ? `${baseMb.toFixed(1)} MB` : `${Math.round(baseMb * 1024)} KB`;
  const formatted720p = (baseMb * 0.46) >= 1 ? `~${(baseMb * 0.46).toFixed(1)} MB` : `~${Math.round(baseMb * 0.46 * 1024)} KB`;
  const formatted480p = (baseMb * 0.23) >= 1 ? `~${(baseMb * 0.23).toFixed(1)} MB` : `~${Math.round(baseMb * 0.23 * 1024)} KB`;
  const formatted360p = (baseMb * 0.12) >= 1 ? `~${(baseMb * 0.12).toFixed(1)} MB` : `~${Math.round(baseMb * 0.12 * 1024)} KB`;

  const audioMb320 = (duration * 320) / (8 * 1024);
  const audioMb128 = (duration * 128) / (8 * 1024);
  const audioMbM4a = (duration * 128 * 0.85) / (8 * 1024);

  const formattedMp3_320 = audioMb320 >= 1 ? `~${audioMb320.toFixed(1)} MB` : `~${Math.round(audioMb320 * 1024)} KB`;
  const formattedMp3_128 = audioMb128 >= 1 ? `~${audioMb128.toFixed(1)} MB` : `~${Math.round(audioMb128 * 1024)} KB`;
  const formattedM4a = audioMbM4a >= 1 ? `~${audioMbM4a.toFixed(1)} MB` : `~${Math.round(audioMbM4a * 1024)} KB`;

  // Define video & audio quality profiles
  const videoQualityOptions: QualityOption[] = useMemo(() => [
    {
      id: '1080p',
      label: '1080p Full HD',
      sublabel: 'Original Bitrate • Max Detail',
      resolution: '1080x1920',
      format: 'mp4',
      type: 'video',
      estimatedSize: formatted1080p,
      savings: 'Original',
      recommended: true,
      qualityParam: '1080p',
    },
    {
      id: '720p',
      label: '720p HD (Balanced)',
      sublabel: 'Crisp Quality • Fast Sharing',
      resolution: '720x1280',
      format: 'mp4',
      type: 'video',
      estimatedSize: formatted720p,
      savings: '⚡ 54% Less MB',
      qualityParam: '720p',
    },
    {
      id: '480p',
      label: '480p SD (Compressed)',
      sublabel: 'Standard Mobile • Low MB',
      resolution: '480x854',
      format: 'mp4',
      type: 'video',
      estimatedSize: formatted480p,
      savings: '📉 77% Less MB',
      qualityParam: '480p',
    },
    {
      id: '360p',
      label: '360p Data Saver',
      sublabel: 'Smallest Storage • Ultra Fast',
      resolution: '360x640',
      format: 'mp4',
      type: 'video',
      estimatedSize: formatted360p,
      savings: '🚀 88% Less MB',
      qualityParam: '360p',
    },
  ], [formatted1080p, formatted720p, formatted480p, formatted360p]);

  const audioQualityOptions: QualityOption[] = useMemo(() => [
    {
      id: 'mp3_320',
      label: 'MP3 (Studio 320 kbps)',
      sublabel: 'Pure Master Audio Clarity',
      bitrate: '320 kbps',
      format: 'mp3',
      type: 'audio',
      estimatedSize: formattedMp3_320,
      savings: 'Best Sound',
      recommended: true,
      qualityParam: 'mp3_320',
    },
    {
      id: 'mp3_128',
      label: 'MP3 (Standard 128 kbps)',
      sublabel: 'Universal Format • Light File',
      bitrate: '128 kbps',
      format: 'mp3',
      type: 'audio',
      estimatedSize: formattedMp3_128,
      savings: '📉 60% Less MB',
      qualityParam: 'mp3_128',
    },
    {
      id: 'm4a',
      label: 'M4A (AAC 128 kbps)',
      sublabel: 'Optimized for Apple & Android',
      bitrate: '128 kbps AAC',
      format: 'm4a',
      type: 'audio',
      estimatedSize: formattedM4a,
      savings: '🚀 Tiny File',
      qualityParam: 'm4a',
    },
  ], [formattedMp3_320, formattedMp3_128, formattedM4a]);

  const imageQualityOptions: QualityOption[] = useMemo(() => [
    {
      id: 'original_img',
      label: 'Original HD Image',
      sublabel: 'Full Resolution JPG',
      format: 'jpg',
      type: 'video',
      estimatedSize: formatted1080p,
      savings: 'Original',
      recommended: true,
      qualityParam: 'original',
    }
  ], [formatted1080p]);

  // Set default selected item
  useEffect(() => {
    if (currentIsVideo) {
      if (activeTab === 'video') setSelectedQualityId('1080p');
      else setSelectedQualityId('mp3_320');
    } else {
      setSelectedQualityId('original_img');
    }
  }, [activeTab, currentIsVideo]);

  const currentOptionsList = !currentIsVideo
    ? imageQualityOptions
    : activeTab === 'video'
    ? videoQualityOptions
    : audioQualityOptions;

  const selectedOption = currentOptionsList.find(o => o.id === selectedQualityId) || currentOptionsList[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `?reel=${media.shortcode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Triggers download for a specific quality option
   */
  const executeDownload = async (option: QualityOption) => {
    setIsProcessing(true);
    setProcessingLabel(
      option.type === 'audio'
        ? `Extracting ${option.label}...`
        : option.qualityParam === '1080p' || option.qualityParam === 'original'
        ? `Starting Original 1080p Download...`
        : `Compressing to ${option.label}...`
    );

    saveToHistory(media);

    try {
      const ext = option.format;
      const filename = `reeldrop_${media.type}_${media.shortcode}_${option.qualityParam}.${ext}`;
      const downloadApiUrl = `/api/media/download?url=${encodeURIComponent(currentMediaUrl)}&quality=${encodeURIComponent(option.qualityParam)}&format=${encodeURIComponent(option.format)}&filename=${encodeURIComponent(filename)}`;

      // For compressed qualities (720p, 480p, 360p) and audio, fetch the transcoded blob directly
      if (option.qualityParam !== '1080p' && option.qualityParam !== 'original') {
        const response = await fetch(downloadApiUrl);
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      } else {
        // Direct stream for 1080p Full HD original
        const a = document.createElement('a');
        a.href = downloadApiUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(() => {
        setIsProcessing(false);
        setProcessingLabel('');
      }, 1000);
    } catch (err) {
      console.error('Download error, falling back to direct stream:', err);
      const ext = option.format;
      const filename = `reeldrop_${media.type}_${media.shortcode}_${option.qualityParam}.${ext}`;
      const downloadApiUrl = `/api/media/download?url=${encodeURIComponent(currentMediaUrl)}&quality=${encodeURIComponent(option.qualityParam)}&format=${encodeURIComponent(option.format)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement('a');
      a.href = downloadApiUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsProcessing(false);
      setProcessingLabel('');
    }
  };

  // Build target URL for QR phone scanner
  const qrDownloadUrl = useMemo(() => {
    if (!selectedOption) return media.downloadProxyUrl;
    const filename = `reeldrop_${media.type}_${media.shortcode}_${selectedOption.qualityParam}.${selectedOption.format}`;
    return `/api/media/download?url=${encodeURIComponent(currentMediaUrl)}&quality=${encodeURIComponent(selectedOption.qualityParam)}&format=${encodeURIComponent(selectedOption.format)}&filename=${encodeURIComponent(filename)}`;
  }, [currentMediaUrl, media.type, media.shortcode, selectedOption, media.downloadProxyUrl]);

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-2 sm:px-4 animate-in fade-in slide-in-from-bottom-6 duration-400">
      
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

      <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Left Column: Media Player / Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start">
          <div className="relative w-full max-w-[320px] aspect-[9/16] max-h-[500px] rounded-2xl overflow-hidden bg-black shadow-xl border border-zinc-800 flex items-center justify-center group">
            
            {currentIsVideo ? (
              <video
                src={currentMediaUrl}
                poster={media.thumbnailUrl}
                controls
                playsInline
                autoPlay
                muted
                loop
                onLoadedMetadata={handleVideoLoadedMetadata}
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
              <span className="uppercase">{media.type} • {currentIsVideo ? 'MP4 / MP3' : 'HD JPG'}</span>
            </div>

            {/* Quality badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] font-medium flex items-center gap-1 pointer-events-none">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Source</span>
            </div>
          </div>

          {/* Carousel thumbnails selector if album */}
          {hasCarousel && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar py-2 max-w-full">
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

        {/* Right Column: Metadata & Multi-Quality Selection */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            
            {/* Creator profile & tag */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                  <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center font-bold text-rose-500 text-sm">
                    {media.username ? media.username.charAt(0).toUpperCase() : 'I'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      @{media.username || 'instagram_creator'}
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
                  {formatted1080p}
                </span>
                <span className="text-[10px] text-emerald-500 font-medium uppercase">
                  No Watermark
                </span>
              </div>
            </div>

            {/* Caption */}
            {media.caption && (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {showFullCaption || media.caption.length <= 120
                    ? media.caption
                    : `${media.caption.slice(0, 120)}...`}
                </p>
                {media.caption.length > 120 && (
                  <button
                    onClick={() => setShowFullCaption(!showFullCaption)}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 mt-1"
                  >
                    {showFullCaption ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Format Mode Tabs (Video vs Audio) */}
            {currentIsVideo && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
                    Select Quality & Compression
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {activeTab === 'video' ? 'Lower MB saves data' : 'Pure audio extracted'}
                  </span>
                </div>

                <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'video'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <FileVideo className="w-3.5 h-3.5 text-rose-500" />
                    <span>Video Qualities (Less MB)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('audio')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'audio'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5 text-purple-500" />
                    <span>Audio Only (MP3)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quality Cards Grid */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-0.5">
              {currentOptionsList.map((option) => {
                const isSelected = selectedOption?.id === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedQualityId(option.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-500/80 shadow-sm ring-1 ring-rose-500/30'
                        : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio dot */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-500' 
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">
                            {option.label}
                          </span>
                          {option.recommended && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                              RECOMMENDED
                            </span>
                          )}
                          {option.savings && option.savings !== 'Original' && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              {option.savings}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {option.sublabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                          {option.estimatedSize}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase">
                          {option.format}
                        </span>
                      </div>

                      {/* 1-Click quick download icon button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeDownload(option);
                        }}
                        disabled={isProcessing}
                        title={`Download ${option.label}`}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700/80 hover:bg-rose-500 hover:text-white text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Download Action Area */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            
            {/* Primary Dynamic Download Button */}
            <button
              onClick={() => executeDownload(selectedOption)}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl btn-gradient font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-rose-500/25 cursor-pointer disabled:opacity-80 transition-all hover:scale-[1.01]"
            >
              <Download className={`w-5 h-5 ${isProcessing ? 'animate-bounce' : ''}`} />
              <span>
                {isProcessing
                  ? processingLabel || 'Processing Download...'
                  : selectedOption.type === 'audio'
                  ? `Download Audio (${selectedOption.label} • ${selectedOption.estimatedSize})`
                  : `Download Video (${selectedOption.label} • ${selectedOption.estimatedSize})`}
              </span>
            </button>

            {/* Scan to Phone Button */}
            <button
              onClick={() => setIsQrOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-500" />
              <span>Scan QR Code to Download on Phone ({selectedOption.label})</span>
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
            <div className="text-center pt-0.5">
              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>100% Free • All Qualities & Audio Supported • Less MB Compression</span>
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Phone Transfer Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        downloadUrl={qrDownloadUrl}
        directMediaUrl={currentMediaUrl}
        shortcode={media.shortcode}
        qualityLabel={selectedOption.label}
      />

    </div>
  );
}

