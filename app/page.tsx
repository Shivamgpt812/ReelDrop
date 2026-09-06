'use client';

import React, { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HeroInput from '@/components/HeroInput';
import ProcessingState from '@/components/ProcessingState';
import MediaPreview from '@/components/MediaPreview';
import HistoryTray from '@/components/HistoryTray';
import FeaturesSection from '@/components/FeaturesSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import { MediaItem, ResolveMediaResponse } from '@/lib/types';

function MainContent() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [media, setMedia] = useState<MediaItem | null>(null);

  const handleResolveStart = () => {
    setStatus('processing');
    setMedia(null);
  };

  const handleResolveSuccess = (data: ResolveMediaResponse) => {
    if (data.media) {
      setMedia(data.media);
      setStatus('success');
    } else {
      setStatus('idle');
    }
  };

  const handleResolveError = () => {
    setStatus('idle');
  };

  const handleReset = () => {
    setStatus('idle');
    setMedia(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      
      {/* Background Decorative Ambient Glows */}
      <div className="glow-accent top-[-100px] left-[-100px] w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-500/5 -z-10" />
      <div className="glow-accent top-[300px] right-[-150px] w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 -z-10" />
      <div className="glow-accent bottom-[-100px] left-[20%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 -z-10" />

      {/* Navbar */}
      <Navbar />

      {/* Main Hero & Processing Area */}
      <main className="flex-1 flex flex-col justify-center">
        
        {/* Dynamic Display based on status */}
        {status === 'processing' ? (
          <ProcessingState />
        ) : status === 'success' && media ? (
          <MediaPreview media={media} onReset={handleReset} />
        ) : (
          <HeroInput
            onResolveStart={handleResolveStart}
            onResolveSuccess={handleResolveSuccess}
            onResolveError={handleResolveError}
            isLoading={false}
          />
        )}

        {/* Local Download History Tray */}
        <HistoryTray />

        {/* Features Section */}
        <div id="features">
          <FeaturesSection />
        </div>

        {/* FAQ Section */}
        <div id="faq">
          <FaqSection />
        </div>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    }>
      <MainContent />
    </Suspense>
  );
}
