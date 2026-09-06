'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, Sparkles } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string;
  directMediaUrl?: string;
  shortcode: string;
}

export default function QrModal({ isOpen, onClose, downloadUrl, directMediaUrl, shortcode }: QrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // On localhost, point the QR code directly to the public media stream so mobile devices can access it without network barriers.
  // In production (e.g. yourdomain.com), use the full domain download proxy.
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );

  const qrTargetUrl = (isLocalhost && directMediaUrl)
    ? directMediaUrl
    : typeof window !== 'undefined'
    ? `${window.location.origin}${downloadUrl}`
    : directMediaUrl || downloadUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 mx-auto mb-3 shadow-lg shadow-rose-500/20">
          <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-rose-500" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
          Scan to Download on Phone
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mb-5">
          Point your iPhone or Android camera at the QR code below to save the video directly.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border border-zinc-200 dark:border-zinc-700 inline-block shadow-md mb-5">
          <QRCodeSVG
            value={qrTargetUrl}
            size={180}
            level="M"
            includeMargin={false}
            fgColor="#09090b"
            bgColor="#ffffff"
          />
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Direct Link Copied!' : 'Copy Direct Video Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Done
          </button>
        </div>

        {/* Bottom badge */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1 text-[11px] text-zinc-400">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span>No app required • Opens directly on phone</span>
        </div>
      </div>
    </div>
  );
}
