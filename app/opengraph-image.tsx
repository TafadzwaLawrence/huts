import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Black square background */}
        <div
          style={{
            background: '#212529',
            width: '600px',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px',
          }}
        >
          {/* Logo text - use actual logo when available */}
          <div
            style={{
              color: '#FFFFFF',
              fontSize: 96,
              fontWeight: 700,
              fontFamily: 'Inter',
              letterSpacing: '-0.02em',
            }}
          >
            HUTS
          </div>
          <div
            style={{
              color: '#ADB5BD',
              fontSize: 28,
              marginTop: 16,
              fontFamily: 'Inter',
            }}
          >
            Find Your Perfect Rental
          </div>
        </div>
        {/* Tagline */}
        <div
          style={{
            color: '#495057',
            fontSize: 24,
            marginTop: 32,
            fontFamily: 'Inter',
          }}
        >
          Zimbabwe's Property Marketplace
        </div>
      </div>
    ),
    { ...size }
  )
}
