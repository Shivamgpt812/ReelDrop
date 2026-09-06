import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ReelDrop - Free Instagram Reel Downloader',
    short_name: 'ReelDrop',
    description: 'Download Instagram Reels, Videos, and Photos in HD 1080p for free without watermarks or ads.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#f43f5e',
    orientation: 'portrait-primary',
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
