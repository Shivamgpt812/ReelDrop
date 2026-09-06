'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Instagram, 
  Clipboard, 
  ArrowRight, 
  X, 
  AlertCircle, 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  DownloadCloud,
  Share2
} from 'lucide-react';
import { ResolveMediaResponse } from '@/lib/types';

interface HeroInputProps {
  onResolveStart: () => void;
  onResolveSuccess: (data: ResolveMediaResponse) => void;
  onResolveError: (err: any) => void;
  isLoading: boolean;
}

// Helper to extract Instagram link from shared text strings
function extractInstagramUrl(rawText: string): string | null {
  if (!rawText) return null;
  const match = rawText.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv|stories|share\/reel)\/[A-Za-z0-9_\-]+(?:\/[A-Za-z0-9_\-]*)?(?:\?[^\s"']*)?/i);
  return match ? match[0] : null;
}

export default function HeroInput({
  onResolveStart,
  onResolveSuccess,
  onResolveError,
  isLoading,
}: HeroInputProps) {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<{ title: string; message: string } | null>(null);

  // Handle Web Share Target parameters (?url=, ?text=, ?title=, ?reel=)
  useEffect(() => {
    const rawUrl = searchParams.get('url') || searchParams.get('text') || searchParams.get('title');
    const reelShortcode = searchParams.get('reel');

    let targetUrl = '';
    if (reelShortcode) {
      targetUrl = `https://www.instagram.com/reel/${reelShortcode}/`;
    } else if (rawUrl) {
      const extracted = extractInstagramUrl(rawUrl);
      targetUrl = extracted || rawUrl;
    }

    if (targetUrl && targetUrl !== url) {
      setUrl(targetUrl);
      // Auto-trigger resolve for incoming mobile share sheet
      triggerResolve(targetUrl);
    }
  }, [searchParams]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const extracted = extractInstagramUrl(text);
        setUrl(extracted || text.trim());
        setErrorMsg(null);
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleClear = () => {
    setUrl('');
    setErrorMsg(null);
  };

  const triggerResolve = async (targetUrl: string) => {
    if (!targetUrl.trim() || isLoading) return;

    setErrorMsg(null);
    onResolveStart();

    try {
      const res = await fetch('/api/media/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data: ResolveMediaResponse = await res.json();

      if (!res.ok || !data.success) {
        const err = data.error;
        const formattedErr = {
          title: err?.code === 'RATE_LIMIT'
            ? 'Rate Limit Exceeded'
            : err?.code === 'INVALID_URL'
            ? 'Invalid Instagram Link'
            : 'Unable to Retrieve Video',
          message: err?.message || 'Please check the link and try again.',
        };
        setErrorMsg(formattedErr);
        onResolveError(formattedErr);
        return;
      }

      onResolveSuccess(data);
    } catch (err: any) {
      const fallbackErr = {
        title: 'Connection Error',
        message: 'Could not connect to the download service. Please check your connection and try again.',
      };
      setErrorMsg(fallbackErr);
      onResolveError(fallbackErr);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerResolve(url);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto text-center px-4 pt-12 pb-6">
      
      {/* Subtle glowing background orb */}
      <div className="glow-accent top-0 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-purple-600/15 -z-10" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 shadow-sm mb-6 backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Free • Unlimited • No Watermark • 1080p HD</span>
      </div>

      {/* Hero Headline & Subheadline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-5 leading-[1.15]">
        Instagram Video & <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
          Reel Downloader
        </span>
      </h1>

      <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Download high quality Instagram Reels, Videos, and Photos directly to your phone or computer. Completely free with no ads.
      </p>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
        <div className="relative p-2 rounded-3xl glass-panel shadow-2xl border border-zinc-200/90 dark:border-zinc-800 transition-all focus-within:border-rose-500/60 focus-within:ring-4 focus-within:ring-rose-500/10">
          
          <div className="flex flex-col sm:flex-row items-center gap-2">
            
            {/* Input & Quick Actions Container */}
            <div className="relative flex-1 w-full flex items-center">
              <div className="pl-4 pr-2 text-zinc-400 pointer-events-none">
                <Instagram className="w-5 h-5 text-rose-500" />
              </div>

              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Paste Instagram Reel or Post link here..."
                aria-label="Instagram link input"
                className="w-full py-3.5 px-2 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
              />

              {/* Clear button if text exists */}
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 mr-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Paste from Clipboard Button */}
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 mr-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Paste Link</span>
              </button>
            </div>

            {/* Prominent Download Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl btn-gradient font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex-shrink-0"
            >
              <span>Download</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </form>

      {/* Trust Badges Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>No Ads / Popups</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Full 1080p HD Quality</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>No Watermark</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>100% Free Forever</span>
        </div>
      </div>

      {/* Error State Banner */}
      {errorMsg && (
        <div className="w-full max-w-2xl mx-auto mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-left shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                {errorMsg.title}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                {errorMsg.message}
              </p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3 Step Quick Guide Cards */}
      <div className="mt-16 text-left max-w-4xl mx-auto">
        <h3 className="text-center text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">
          How to Download in 3 Easy Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl glass-card flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Copy Video Link</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Open Instagram, find the Reel or Video you like, tap the share icon and copy the link.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Paste Link Above</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Paste the copied URL into the box above and hit the Download button.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Save in HD MP4</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Preview the video and click Download to save the original 1080p MP4 directly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
