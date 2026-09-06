import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ReelDrop - Free Instagram Reel & Video Downloader in HD 1080p';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '15%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,63,94,0.22) 0%, rgba(244,63,94,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: '15%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0) 70%)',
          }}
        />

        {/* Brand Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '9999px',
            padding: '8px 22px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#f43f5e',
            }}
          />
          <span
            style={{
              color: '#fda4af',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ReelDrop • Free & Unlimited
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '54px',
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '16px',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Instagram Reel & Video</span>
          <span
            style={{
              background: 'linear-gradient(90deg, #f59e0b, #f43f5e, #a855f7)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Downloader in HD 1080p
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '850px',
            marginBottom: '32px',
          }}
        >
          Download Instagram Reels, Videos, Stories & Photos with zero watermark and no login.
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {['1080p Lossless HD', 'No Watermark', 'Zero Login', '100% Free Forever'].map((badge) => (
            <div
              key={badge}
              style={{
                background: 'rgba(39, 39, 42, 0.85)',
                border: '1px solid rgba(63, 63, 70, 0.8)',
                borderRadius: '12px',
                padding: '8px 18px',
                color: '#e4e4e7',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              ✓ {badge}
            </div>
          ))}
        </div>

        {/* Domain footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            color: '#71717a',
            fontSize: '17px',
            fontWeight: 500,
          }}
        >
          https://reeldrop.shivamweb.in
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
