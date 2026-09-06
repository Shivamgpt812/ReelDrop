'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Sparkles, 
  Smartphone, 
  EyeOff
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lossless HD 1080p Quality',
    description: 'Download original high-definition MP4 videos and full-resolution photos directly with maximum visual clarity.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Sparkles,
    title: 'Clean Direct Downloads',
    description: 'No third-party watermark injections, logo overlays, or ads. Save clean files directly to your device storage.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Lock,
    title: 'Safe & Secure Downloads',
    description: 'Enjoy fast, direct downloads with encrypted connections and strict safety checks on all links.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Smartphone,
    title: 'All Devices Supported',
    description: 'Optimized for iPhone, Android, iPad, Mac, and Windows with a smooth interface and instant dark mode.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: ShieldCheck,
    title: '100% Free Forever',
    description: 'No hidden subscription fees, no credit cards, and no limits on how many videos you can download.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: EyeOff,
    title: 'Zero Login Required',
    description: 'Completely private and anonymous. You never need to enter passwords, emails, or personal details.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-3">
          <span>Why ReelDrop</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          The Cleanest Way to Save Instagram Videos
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mt-2">
          Everything you need to save and backup your favorite Instagram Reels and videos instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-6 rounded-3xl glass-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
