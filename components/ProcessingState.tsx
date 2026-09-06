'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Sparkles, Film, ArrowDownToLine } from 'lucide-react';

const CONSUMER_STEPS = [
  { label: 'Connecting to Instagram post...', icon: Film },
  { label: 'Extracting original HD video stream...', icon: Sparkles },
  { label: 'Preparing your high-speed download...', icon: ArrowDownToLine },
];

export default function ProcessingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < CONSUMER_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-8 rounded-3xl glass-panel shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Background glowing gradient accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        
        {/* Animated Spinner Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 animate-pulse">
            <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            </div>
          </div>
        </div>

        {/* Title & Status */}
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          Fetching your video...
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
          Getting your high-definition media ready for instant download.
        </p>

        {/* Step-by-step progress cards */}
        <div className="w-full max-w-md space-y-3 text-left">
          {CONSUMER_STEPS.map((step, index) => {
            const isFinished = index < activeStep;
            const isCurrent = index === activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 shadow-sm'
                    : isFinished
                    ? 'bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    : 'opacity-40 border border-transparent text-zinc-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isFinished
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      : isCurrent
                      ? 'bg-rose-500 text-white animate-bounce'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <span
                  className={`text-xs font-medium ${
                    isCurrent
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : isFinished
                      ? 'text-zinc-700 dark:text-zinc-300'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
