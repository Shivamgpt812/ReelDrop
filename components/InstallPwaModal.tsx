'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-left">
            
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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

            {/* Instructions based on OS */}
            {isIOS ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>How to install on iPhone & iPad:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-amber-800 dark:text-amber-400">
                  <li>Tap the <strong>Share</strong> button at the bottom of Safari.</li>
                  <li>Scroll down and select <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>"Add"</strong> in the top-right corner.</li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl btn-gradient font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Add to Home Screen Now</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                <div className="font-bold">How to install on Android / Desktop Chrome:</div>
                <p>Tap your browser menu (<strong>⋮</strong> or <strong>Share</strong>) and click <strong>"Install ReelDrop"</strong> or <strong>"Add to Home screen"</strong>.</p>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-4 py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}
