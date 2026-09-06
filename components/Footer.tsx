'use client';

import React from 'react';
import { Instagram, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        
        {/* Brand & Disclaimer */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[6px] flex items-center justify-center">
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>
            <span className="font-bold text-zinc-900 dark:text-white text-sm">ReelDrop</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-medium">v1.0</span>
          </div>
          <p className="max-w-md text-[11px] text-zinc-400 leading-normal">
            ReelDrop is a fast, high-definition Instagram video & Reel downloader.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
          <span className="flex items-center gap-1 text-rose-500">
            <Sparkles className="w-3.5 h-3.5" />
            Instant HD Downloader
          </span>
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            FAQ
          </a>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-zinc-400">
            © {new Date().getFullYear()} ReelDrop. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
}
