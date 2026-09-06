import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReelDrop - Free Instagram Reel & Video Downloader',
  description: 'Download Instagram Reels, Videos, and Photos in HD 1080p for free without watermarks or ads.',
  keywords: ['Instagram Reel Downloader', 'Download Instagram Reels', 'Instagram Video Downloader', 'Free Instagram Downloader', 'Reel Downloader'],
  authors: [{ name: 'ReelDrop Team' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ReelDrop',
  },
  openGraph: {
    title: 'ReelDrop - Free Instagram Reel & Video Downloader',
    description: 'Download Instagram Reels, Videos, and Photos in HD 1080p for free without watermarks.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-rose-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
