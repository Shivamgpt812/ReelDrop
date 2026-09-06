import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ReelDrop - Free Instagram Reel & Video Downloader in HD 1080p',
    short_name: 'ReelDrop',
    description: 'Download Instagram Reels, Videos, Stories, and Photos in HD 1080p for free without watermarks or login.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#f43f5e',
    orientation: 'portrait-primary',
    lang: 'en',
    dir: 'ltr',
    categories: ['utilities', 'multimedia', 'social', 'video'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    // Web Share Target API: allows ReelDrop to appear in Android / iOS share sheets when sharing links from Instagram
    share_target: {
      action: '/',
      method: 'get',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      } as any,
    } as any,
  } as any;
}
