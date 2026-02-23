/**
 * Shared OG / social media image templates for Huts.
 * Designed to mirror the home page aesthetic — clean B&W, hero headline,
 * search bar visual, stats row, and trust section elements.
 *
 * Satori constraints: inline styles only, flexbox only (no CSS Grid),
 * no Tailwind, no textTransform, every div needs display:'flex'.
 */

import { BRAND } from './brand'
import { readFile } from 'fs/promises'
import { join } from 'path'

const { colors: c, fonts: f } = BRAND

// ─── Logo Helper ─────────────────────────────────────────────────────

let logoDataUrl: string | null = null

async function getLogoDataUrl(): Promise<string> {
  if (logoDataUrl) return logoDataUrl
  const logoPath = join(process.cwd(), 'public', 'huts-high-resolution-logo.png')
  const buffer = await readFile(logoPath)
  logoDataUrl = `data:image/png;base64,${buffer.toString('base64')}`
  return logoDataUrl
}

export async function loadLogo(): Promise<string> {
  return getLogoDataUrl()
}

// ─── Shared Primitives ───────────────────────────────────────────────

/** Dark pill badge with logo + "HUTS" — matches the homepage hero badges */
function HutsPill({
  logoSrc,
  size = 'md',
}: {
  logoSrc?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const cfg = {
    sm: { img: 20, text: 13, py: 6, px: 14, gap: 6 },
    md: { img: 28, text: 16, py: 10, px: 22, gap: 8 },
    lg: { img: 36, text: 20, py: 12, px: 28, gap: 10 },
  }[size]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: cfg.gap,
        background: c.charcoal,
        padding: `${cfg.py}px ${cfg.px}px`,
        borderRadius: 999,
      }}
    >
      {logoSrc && (
        <img
          src={logoSrc}
          width={cfg.img}
          height={cfg.img}
          style={{ width: cfg.img, height: cfg.img, objectFit: 'contain' }}
          alt=""
        />
      )}
      <div
        style={{
          color: c.pureWhite,
          fontSize: cfg.text,
          fontWeight: f.weights.bold,
          letterSpacing: '0.1em',
          display: 'flex',
        }}
      >
        HUTS
      </div>
    </div>
  )
}

/** Search bar visual matching the home page hero search input */
function SearchBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: compact ? 420 : 640,
        background: c.pureWhite,
        border: `2px solid ${c.lightGray}`,
        borderRadius: compact ? 12 : 16,
        padding: compact ? '8px 8px 8px 16px' : '10px 10px 10px 20px',
        gap: compact ? 10 : 14,
        boxShadow: '0 4px 24px rgba(33, 37, 41, 0.06)',
      }}
    >
      {/* Location pin indicator */}
      <div
        style={{
          width: compact ? 28 : 36,
          height: compact ? 28 : 36,
          borderRadius: compact ? 6 : 8,
          background: c.offWhite,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: compact ? 8 : 10,
            height: compact ? 8 : 10,
            borderRadius: '50%',
            border: `2px solid ${c.charcoal}`,
            display: 'flex',
          }}
        />
      </div>
      <div
        style={{
          color: c.mediumGray,
          fontSize: compact ? 13 : 16,
          display: 'flex',
          flex: 1,
        }}
      >
        Where do you want to live?
      </div>
      <div
        style={{
          background: c.charcoal,
          color: c.pureWhite,
          fontSize: compact ? 12 : 14,
          fontWeight: f.weights.bold,
          padding: compact ? '10px 18px' : '12px 28px',
          borderRadius: compact ? 8 : 10,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        Search
      </div>
    </div>
  )
}

/** Stats row — 4 key metrics matching the home page hero stats row */
function StatsRow({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const stats = [
    { value: '500+', label: 'Listings' },
    { value: '50+', label: 'Areas' },
    { value: '24h', label: 'Response' },
    { value: '100%', label: 'Verified' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 20 : 40 }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: compact ? 20 : 26,
              fontWeight: f.weights.bold,
              color: dark ? c.pureWhite : c.charcoal,
              display: 'flex',
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontSize: compact ? 10 : 12,
              color: dark ? c.darkGray : c.mediumGray,
              display: 'flex',
              marginTop: 2,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Gradient overlay from bottom */
function BottomGradient({ height = '60%' }: { height?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        background: 'linear-gradient(to top, rgba(33, 37, 41, 0.95), transparent)',
        display: 'flex',
      }}
    />
  )
}

// ─── Template: Branded Card (Hero Section) ───────────────────────────

export interface BrandedCardProps {
  title: string
  subtitle?: string
  footer?: string
  logoSrc?: string
}

/**
 * Recreates the home page hero section aesthetic.
 * White bg, bold headline, search bar, stats row.
 * Pass `footer` to show full layout with search bar + stats;
 * omit for compact mode (logo + headline + subtitle only).
 * Default size: 1200×630.
 */
export function brandedCard({ title, subtitle, footer, logoSrc }: BrandedCardProps) {
  const full = !!footer

  return (
    <div
      style={{
        background: c.pureWhite,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: f.family,
        position: 'relative',
      }}
    >
      {/* Subtle gradient edges like the home page hero */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(to bottom, ${c.offWhite}, transparent)`,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(to top, ${c.offWhite}, transparent)`,
          display: 'flex',
        }}
      />

      {/* Decorative radial gradient like homepage bg blurs */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '40%',
          background:
            'radial-gradient(circle at 100% 0%, rgba(33,37,41,0.03) 0%, transparent 60%)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '40%',
          height: '40%',
          background:
            'radial-gradient(circle at 0% 100%, rgba(33,37,41,0.03) 0%, transparent 60%)',
          display: 'flex',
        }}
      />

      {/* Logo pill badge */}
      <HutsPill logoSrc={logoSrc} size={full ? 'md' : 'lg'} />

      {/* Headline */}
      <div
        style={{
          fontSize: full ? 60 : 48,
          fontWeight: f.weights.bold,
          color: c.charcoal,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textAlign: 'center',
          display: 'flex',
          marginTop: full ? 28 : 24,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: full ? 22 : 20,
            color: c.darkGray,
            textAlign: 'center',
            lineHeight: 1.4,
            display: 'flex',
            marginTop: 12,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Search bar (full mode) */}
      {full && (
        <div style={{ display: 'flex', marginTop: 28 }}>
          <SearchBar />
        </div>
      )}

      {/* Stats row (full mode) */}
      {full && (
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            paddingTop: 24,
            borderTop: `1px solid ${c.lightGray}`,
          }}
        >
          <StatsRow />
        </div>
      )}

      {/* Footer URL */}
      {footer && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            color: c.mediumGray,
            fontSize: 14,
            display: 'flex',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

// ─── Template: Property Card (Photo + Overlay) ──────────────────────

export interface PropertyCardProps {
  title: string
  price: string
  city: string
  beds: number
  baths: number
  sqft?: number | null
  imageUrl?: string
  listingType?: 'rent' | 'sale'
  logoSrc?: string
}

/**
 * Property listing card with photo background + gradient overlay.
 * Mirrors the PropertyCard component from the home page grid.
 * Default size: 1200×630.
 */
export function propertyCard({
  title,
  price,
  city,
  beds,
  baths,
  sqft,
  imageUrl,
  listingType,
  logoSrc,
}: PropertyCardProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        fontFamily: f.family,
      }}
    >
      {/* Background image or fallback */}
      {imageUrl ? (
        <img
          src={imageUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt=""
        />
      ) : (
        <div
          style={{ background: c.lightGray, width: '100%', height: '100%', display: 'flex' }}
        />
      )}

      <BottomGradient />

      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: BRAND.spacing['2xl'],
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Listing type badge */}
        {listingType && (
          <div
            style={{
              background: listingType === 'rent' ? c.charcoal : c.pureBlack,
              color: c.pureWhite,
              fontSize: 18,
              fontWeight: f.weights.semibold,
              padding: '6px 16px',
              borderRadius: BRAND.radius.sm,
              alignSelf: 'flex-start',
              marginBottom: 12,
              letterSpacing: '0.05em',
              display: 'flex',
            }}
          >
            FOR {listingType === 'rent' ? 'RENT' : 'SALE'}
          </div>
        )}

        {/* Price badge — matches homepage card price pill */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: c.charcoal,
            fontSize: 42,
            fontWeight: f.weights.bold,
            padding: '16px 24px',
            borderRadius: BRAND.radius.lg,
            alignSelf: 'flex-start',
            marginBottom: 16,
            display: 'flex',
          }}
        >
          {price}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: f.weights.bold,
            color: c.pureWhite,
            marginBottom: 12,
            lineHeight: 1.2,
            maxWidth: '90%',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Location + specs — matches homepage property card details row */}
        <div
          style={{
            fontSize: 28,
            color: c.lightGray,
            display: 'flex',
            gap: 24,
          }}
        >
          <span style={{ display: 'flex' }}>{city}, Zimbabwe</span>
          <span style={{ display: 'flex' }}>•</span>
          <span style={{ display: 'flex' }}>{beds} bed</span>
          <span style={{ display: 'flex' }}>•</span>
          {sqft && (
            <>
              <span style={{ display: 'flex' }}>•</span>
              <span style={{ display: 'flex' }}>{sqft.toLocaleString()} sqft</span>
            </>
          )}
          <span style={{ display: 'flex' }}>{baths} bath</span>
        </div>
      </div>

      {/* Logo badge — top-right pill */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          right: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(33, 37, 41, 0.9)',
          padding: '10px 16px',
          borderRadius: BRAND.radius.md,
        }}
      >
        {logoSrc && (
          <img
            src={logoSrc}
            width={48}
            height={48}
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            alt=""
          />
        )}
        <div
          style={{
            color: c.pureWhite,
            fontSize: 26,
            fontWeight: f.weights.bold,
            fontFamily: f.family,
            display: 'flex',
          }}
        >
          HUTS
        </div>
      </div>
    </div>
  )
}

// ─── Template: Social Square (Instagram / WhatsApp) ─────────────────

export interface SocialSquareProps {
  title: string
  subtitle?: string
  imageUrl?: string
  badge?: string
  logoSrc?: string
}

/**
 * Square (1080×1080) mirroring the full hero section layout.
 * White bg, logo pill, headline, search bar, stats, popular area pills.
 */
export function socialSquare({ title, subtitle, imageUrl, badge, logoSrc }: SocialSquareProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: f.family,
        background: c.pureWhite,
        position: 'relative',
      }}
    >
      {/* Decorative radial gradients like homepage hero bg */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '50%',
          background:
            'radial-gradient(circle at 100% 0%, rgba(33,37,41,0.03) 0%, transparent 60%)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '50%',
          height: '50%',
          background:
            'radial-gradient(circle at 0% 100%, rgba(33,37,41,0.03) 0%, transparent 60%)',
          display: 'flex',
        }}
      />

      {/* Content column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          padding: '64px 48px',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <HutsPill logoSrc={logoSrc} size="lg" />

        <div
          style={{
            fontSize: 56,
            fontWeight: f.weights.bold,
            color: c.charcoal,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            textAlign: 'center',
            display: 'flex',
            marginTop: 36,
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: 24,
              color: c.darkGray,
              textAlign: 'center',
              lineHeight: 1.4,
              display: 'flex',
              marginTop: 16,
              marginBottom: 36,
            }}
          >
            {subtitle}
          </div>
        )}

        <SearchBar />

        <div
          style={{
            display: 'flex',
            marginTop: 40,
            paddingTop: 28,
            borderTop: `1px solid ${c.lightGray}`,
          }}
        >
          <StatsRow />
        </div>

        {/* Popular area pills — matches homepage hero quick links */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 36,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Harare', 'Bulawayo', 'Gweru', 'Mutare'].map((area) => (
            <div
              key={area}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                border: `2px solid ${c.lightGray}`,
                borderRadius: 999,
                fontSize: 14,
                fontWeight: f.weights.semibold,
                color: c.darkGray,
              }}
            >
              {area}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom URL */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          color: c.mediumGray,
          fontSize: 16,
          display: 'flex',
        }}
      >
        huts.co.zw
      </div>
    </div>
  )
}

// ─── Template: Social Portrait (Instagram Stories / Pinterest) ───────

export interface SocialPortraitProps {
  title: string
  price?: string
  subtitle?: string
  imageUrl?: string
  badge?: string
  logoSrc?: string
}

/**
 * Portrait (1080×1350 or 1000×1500) — hero top + trust section bottom.
 * Mirrors the homepage's white hero → charcoal "Built on trust" transition.
 */
export function socialPortrait({
  title,
  price,
  subtitle,
  imageUrl,
  badge,
  logoSrc,
}: SocialPortraitProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: f.family,
      }}
    >
      {/* Top: White hero section (55%) */}
      <div
        style={{
          width: '100%',
          height: '55%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: c.pureWhite,
          padding: 48,
          position: 'relative',
        }}
      >
        {/* Bottom fade matching homepage gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(to top, ${c.offWhite}, transparent)`,
            display: 'flex',
          }}
        />

        <HutsPill logoSrc={logoSrc} />

        <div
          style={{
            fontSize: 44,
            fontWeight: f.weights.bold,
            color: c.charcoal,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            textAlign: 'center',
            display: 'flex',
            marginTop: 28,
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: 20,
              color: c.darkGray,
              textAlign: 'center',
              lineHeight: 1.4,
              display: 'flex',
              marginTop: 12,
              marginBottom: 28,
              maxWidth: '90%',
            }}
          >
            {subtitle}
          </div>
        )}

        <SearchBar compact />

        {/* Stats row below search bar */}
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            paddingTop: 20,
            borderTop: `1px solid ${c.lightGray}`,
          }}
        >
          <StatsRow compact />
        </div>
      </div>

      {/* Bottom: Charcoal trust section (45%) — matches homepage trust bar */}
      <div
        style={{
          width: '100%',
          height: '45%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: c.charcoal,
          padding: 48,
          position: 'relative',
        }}
      >
        {/* Ambient glow like homepage trust section */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '25%',
            width: '50%',
            height: '50%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            fontSize: 13,
            fontWeight: f.weights.semibold,
            color: c.darkGray,
            letterSpacing: '0.12em',
            display: 'flex',
            marginBottom: 16,
            position: 'relative',
          }}
        >
          WHY CHOOSE HUTS
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: f.weights.bold,
            color: c.pureWhite,
            display: 'flex',
            marginBottom: 32,
            position: 'relative',
          }}
        >
          Built on trust
        </div>

        {/* Trust bento cards — matches homepage trust section grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'center',
            position: 'relative',
            maxWidth: 460,
          }}
        >
          {[
            { val: '100%', label: 'Verified' },
            { val: '24h', label: 'Always Fresh' },
            { val: '50+', label: 'Neighborhoods' },
            { val: '$0', label: 'Hidden Fees' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                width: 200,
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: f.weights.bold,
                  color: c.pureWhite,
                  display: 'flex',
                }}
              >
                {item.val}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: c.mediumGray,
                  display: 'flex',
                  marginTop: 4,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            color: c.darkGray,
            fontSize: 14,
            display: 'flex',
          }}
        >
          huts.co.zw
        </div>
      </div>
    </div>
  )
}

// ─── Template: Twitter Card ─────────────────────────────────────────

export interface TwitterCardProps {
  title: string
  subtitle?: string
  imageUrl?: string
  logoSrc?: string
}

/**
 * Twitter/X large summary card (1200×675). Split layout:
 * Left white panel (hero) + Right charcoal panel (trust).
 * Mirrors the homepage's hero → trust section side-by-side.
 */
export function twitterCard({ title, subtitle, imageUrl, logoSrc }: TwitterCardProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: f.family,
      }}
    >
      {/* Left: White hero panel */}
      <div
        style={{
          width: '50%',
          height: '100%',
          background: c.pureWhite,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <HutsPill logoSrc={logoSrc} size="sm" />

        <div
          style={{
            fontSize: 36,
            fontWeight: f.weights.bold,
            color: c.charcoal,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            display: 'flex',
            marginTop: 20,
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: 16,
              color: c.darkGray,
              lineHeight: 1.5,
              display: 'flex',
              marginTop: 10,
            }}
          >
            {subtitle}
          </div>
        )}

        <div style={{ display: 'flex', marginTop: 24 }}>
          <SearchBar compact />
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
          }}
        >
          <StatsRow compact />
        </div>
      </div>

      {/* Right: Charcoal trust panel */}
      <div
        style={{
          width: '50%',
          height: '100%',
          background: c.charcoal,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.04) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            fontSize: 11,
            fontWeight: f.weights.semibold,
            color: c.darkGray,
            letterSpacing: '0.12em',
            display: 'flex',
            marginBottom: 14,
            position: 'relative',
          }}
        >
          WHY CHOOSE HUTS
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: f.weights.bold,
            color: c.pureWhite,
            display: 'flex',
            marginBottom: 28,
            position: 'relative',
          }}
        >
          Built on trust
        </div>

        {/* Trust bento 2×2 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            position: 'relative',
            maxWidth: 420,
          }}
        >
          {[
            { val: '100%', label: 'Verified' },
            { val: '24h', label: 'Always Fresh' },
            { val: '50+', label: 'Areas' },
            { val: '$0', label: 'Fees' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                width: 180,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: f.weights.bold,
                  color: c.pureWhite,
                  display: 'flex',
                }}
              >
                {item.val}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: c.mediumGray,
                  display: 'flex',
                  marginTop: 2,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            color: c.darkGray,
            fontSize: 13,
            display: 'flex',
          }}
        >
          huts.co.zw
        </div>
      </div>
    </div>
  )
}
