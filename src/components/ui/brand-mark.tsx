import { cn } from '@/lib/utils'

/**
 * Placeholder brand lockup, standing in until the client supplies the real
 * MR crest as SVG. It is drawn rather than left blank so the hero and header
 * read as designed instead of unfinished — swap `BrandMark` for an <Image>
 * of the real asset and nothing else needs to change.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="ماري رجائي">
      <defs>
        <linearGradient id="mr-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3C77E" />
          <stop offset="45%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#E3C77E" />
        </linearGradient>
      </defs>

      {/* Open ring, broken at the top like the crest in the mockup */}
      <path
        d="M100 14a86 86 0 1 1-60.8 25.2"
        fill="none"
        stroke="url(#mr-gold)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="72" fill="none" stroke="url(#mr-gold)" strokeWidth="1" opacity="0.45" />

      {/* Monogram */}
      <text
        x="100"
        y="112"
        textAnchor="middle"
        fill="url(#mr-gold)"
        style={{ fontFamily: 'var(--font-almarai), serif', fontSize: '62px', fontWeight: 800 }}
      >
        MR
      </text>

      {/* Flourish under the monogram */}
      <path d="M62 132h30l8-8 8 8h30" fill="none" stroke="url(#mr-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="124" r="2.5" fill="url(#mr-gold)" />

      <text
        x="100"
        y="156"
        textAnchor="middle"
        fill="#C9A24B"
        style={{ fontFamily: 'var(--font-cairo), sans-serif', fontSize: '11px', letterSpacing: '3px' }}
      >
        BEAUTY ACADEMY
      </text>
    </svg>
  )
}

/**
 * Thin gold arabesque flourish used to break up dark bands, echoing the
 * hairline-and-diamond motif from the design system (PRD §3).
 */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 40" className={cn('text-gold-500', className)} aria-hidden="true">
      <path
        d="M10 20h110M200 20h110"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M120 20q20-14 40 0-20 14-40 0Zm40 0q20-14 40 0-20 14-40 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="160" cy="20" r="3" fill="currentColor" />
    </svg>
  )
}

/** Large soft gold swirl for hero backgrounds. Purely decorative. */
export function HeroSwirl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M-40 420C120 380 200 300 240 180 270 90 350 40 470 60" strokeWidth="1.5" opacity="0.5" />
        <path d="M-40 470C140 430 240 340 285 205 320 100 410 45 540 70" strokeWidth="1" opacity="0.35" />
        <path d="M-40 520C160 480 280 380 330 230 370 110 470 50 610 80" strokeWidth="0.75" opacity="0.22" />
      </g>
    </svg>
  )
}
