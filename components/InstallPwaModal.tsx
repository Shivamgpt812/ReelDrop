'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Share2, Smartphone, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if running standalone already
    const isApp = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration error:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const [isIosShared, setIsIosShared] = useState(false);

  const handleAddToHomeScreen = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsModalOpen(false);
        }
      } catch (e) {
        console.warn('Install prompt error:', e);
      }
      return;
    }

    // iOS Safari or browser fallback: trigger native Web Share API which directly reveals "Add to Home Screen" option
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ReelDrop - Instagram Video Downloader',
          text: 'Save ReelDrop to your home screen for 1-tap Instagram downloads.',
          url: window.location.origin,
        });
        setIsIosShared(true);
      } catch (err) {
        // User cancelled share dialog or not supported
        setIsIosShared(true);
      }
    } else {
      setIsIosShared(true);
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Install App Button for Navbar */}
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all shadow-sm"
        title="Install ReelDrop as mobile or desktop App"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App & Share</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Instructional Modal (for iOS or non-prompt browsers) */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/20">
                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-rose-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Install ReelDrop App
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Direct Instagram "Share to ReelDrop" integration
                </p>
              </div>
            </div>

            {/* Benefit highlights */}
            <div className="space-y-2.5 my-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-xs">
              <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Instant Share Sheet:</strong> Tap "Share" inside Instagram and choose ReelDrop to download automatically.</span>
              </div>
              <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Lightning Fast:</strong> Launches instantly from your home screen with zero ads or lag.</span>
              </div>
              <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Pure Audio & HD Video:</strong> 1-click downloads with zero storage bloat.</span>
              </div>
            </div>

            {/* Platform Quick Guidance */}
            {isIOS ? (
              <div className="space-y-3 mb-5">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-bold flex items-center gap-1.5 mb-1">
                    <Share2 className="w-4 h-4 text-rose-500" />
                    How to Add to iPhone Home Screen:
                  </span>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Apple iOS requires 2 quick taps from Safari&apos;s Share menu:
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      1
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300">
                      Tap the <strong>Share</strong> icon <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-[10px]">⎋ / [↑]</span> (or click the button below)
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 ring-1 ring-rose-500/30">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      2
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300">
                      Scroll down in the menu & tap <strong className="text-rose-500">"Add to Home Screen" ⊞</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      3
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300">
                      Tap <strong>"Add"</strong> in the top-right corner to finish!
                    </div>
                  </div>
                </div>

                {isIosShared && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold text-center animate-pulse">
                    👇 In the menu below, scroll down & tap &quot;Add to Home Screen&quot; ⊞
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 space-y-2 mb-5">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Android & Chrome Shortcut:</span>
                </div>
                <p>Click below to install ReelDrop directly to your home screen or app drawer with 1 tap.</p>
              </div>
            )}

            {/* Action Buttons: Add to Home Screen + Close */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={handleAddToHomeScreen}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl btn-gradient font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>{isIOS ? 'Open Share Menu & Add ⊞' : 'Add to Home Screen'}</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-28 py-3 px-4 rounded-2xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
