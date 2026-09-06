import type { Metadata, Viewport } from 'next';
import './globals.css';

const BASE_URL = 'https://reeldrop.shivamweb.in';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ReelDrop - Free Instagram Reel & Video Downloader in HD 1080p',
    template: '%s | ReelDrop',
  },
  description:
    'Download Instagram Reels, Videos, Stories, and Photos in HD 1080p for free without watermarks or login. Fast, secure, unlimited downloads on iPhone, Android, Mac, and PC.',
  applicationName: 'ReelDrop',
  authors: [{ name: 'Shivam', url: BASE_URL }],
  creator: 'Shivam',
  publisher: 'ReelDrop',
  category: 'Multimedia / Utilities',
  keywords: [
    'Instagram Reel Downloader',
    'Download Instagram Reels',
    'Instagram Video Downloader',
    'Insta Reel Saver',
    'Save Instagram Video',
    'Instagram MP4 Downloader',
    'Download Reels Online',
    'Free Instagram Downloader',
    'Instagram Story Downloader',
    'Instagram Photo Downloader',
    'Instagram Audio Downloader',
    'HD Instagram Video Downloader',
    'Instagram Reel Download 1080p',
    'Instagram Downloader without Watermark',
    'Instagram Reels Saver without login',
    'Reel Downloader iPhone Android PC',
    'Fast Instagram Video Saver',
  ],
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'BhsSxwgrekFkVBV3AcBCPDSqiOd7hEWu7ZBAUHnx4Dc',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ReelDrop',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'ReelDrop',
    title: 'ReelDrop - Free Instagram Reel & Video Downloader (HD 1080p)',
    description:
      'Download Instagram Reels, Videos, Stories, and Photos in HD 1080p for free without watermarks or login. Fast, secure, and clean downloads on any device.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReelDrop - Free Instagram Reel & Video Downloader in HD 1080p',
    description:
      'Download Instagram Reels, Videos, Stories, and Photos in HD 1080p for free without watermarks or login.',
    creator: '@shivam',
  },
};

// Structured Schema Markup
const structuredSchemas = [
  // 1. WebSite Schema
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: `${BASE_URL}/`,
    name: 'ReelDrop',
    description:
      'Free Instagram Reel, Video, Story, and Photo Downloader in HD 1080p without watermark or login.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'en-US',
  },
  // 2. Organization Schema
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'ReelDrop',
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/icons/icon-512x512.png`,
    sameAs: [],
  },
  // 3. WebApplication / SoftwareApplication Schema
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${BASE_URL}/#webapp`,
    name: 'ReelDrop Instagram Downloader',
    url: `${BASE_URL}/`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All (iOS, Android, Windows, macOS, Linux)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free online Instagram Reel, Video, and Photo Downloader with HD 1080p quality, no watermark, and no login required.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1280',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Lossless HD 1080p Video Download',
      'No Watermark or Brand Logo',
      'Zero Login Required',
      '100% Free Forever',
      'Compatible with iPhone, Android, Mac, and Windows',
    ],
  },
  // 4. FAQPage Schema
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_URL}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I download Instagram Reels & Videos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply copy any public Instagram Reel or Post URL, paste it into the search box on the homepage, and click Download. You will see an instant video preview and can download the high-definition MP4 video file directly to your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to log in or create an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. ReelDrop requires no account creation, passwords, or login. You can paste and download public reels instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'What video quality and format will I get?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ReelDrop retrieves original HD 1080p source video streams in standard MP4 (H.264) format, which is compatible with all mobile devices, PCs, and editing software.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there any download limits?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can download as many videos as you want. Standard rate limits apply only to prevent automated bot spam and ensure high server availability for everyone.',
        },
      },
    ],
  },
  // 5. HowTo Schema
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${BASE_URL}/#howto`,
    name: 'How to Download Instagram Reels and Videos in HD',
    description:
      'Step-by-step guide to download high-definition Instagram Reels, Videos, and Photos for free using ReelDrop.',
    totalTime: 'PT1M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Copy Video Link',
        text: 'Open Instagram, find the Reel or Video you like, tap the share icon and copy the link.',
        url: `${BASE_URL}/#step1`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Paste Link into ReelDrop',
        text: 'Paste the copied URL into the search field on ReelDrop and click the Download button.',
        url: `${BASE_URL}/#step2`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Save in HD MP4',
        text: 'Preview the resolved video and click Download to save the original 1080p MP4 file directly to your device.',
        url: `${BASE_URL}/#step3`,
      },
    ],
  },
  // 6. BreadcrumbList Schema
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/`,
      },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {structuredSchemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-rose-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
