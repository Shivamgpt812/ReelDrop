'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I download Instagram Reels & Videos?',
    a: 'Simply copy any public Instagram Reel or Post URL, paste it into the search box on the homepage, and click Download. You will see an instant video preview and can download the high-definition MP4 video file directly to your device.',
  },
  {
    q: 'Do I need to log in or create an account?',
    a: 'No. ReelDrop requires no account creation, passwords, or login. You can paste and download public reels instantly.',
  },
  {
    q: 'What video quality and format will I get?',
    a: 'ReelDrop retrieves original HD 1080p source video streams in standard MP4 (H.264) format, which is compatible with all mobile devices, PCs, and editing software.',
  },
  {
    q: 'Are there any download limits?',
    a: 'You can download as many videos as you want. Standard rate limits apply only to prevent automated bot spam and ensure high server availability for everyone.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              className="glass-card rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 dark:text-white focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
