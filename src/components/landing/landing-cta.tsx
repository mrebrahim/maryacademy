'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { CHECKOUT_ENABLED } from '@/config/features'
import { offer, type CtaLocation } from '@/config/offer'
import { whatsappLink } from '@/config/site'
import { trackCtaClick } from '@/lib/analytics'
import { cn, formatPrice } from '@/lib/utils'

/**
 * The landing page's call to action, repeated down the page.
 *
 * Every instance points at checkout, not at WhatsApp. A WhatsApp CTA turns
 * a convinced visitor into a manual conversation that has to be worked and
 * usually is not — the page was doing that in three places. One secondary
 * WhatsApp link survives, at the very end, for people with a real question.
 *
 * Destination and labels come from src/config/offer.ts; the price comes
 * from the database via props. Neither is written inline, so all three
 * buttons cannot drift apart.
 *
 * The WhatsApp fallback only applies if checkout is switched off or the
 * course has no price — never as the default route.
 */
export function LandingCta({
  priceEgp,
  compareAtEgp,
  location,
  label,
  compact = false,
  tone = 'dark',
}: {
  priceEgp: number | null
  compareAtEgp?: number | null
  location: CtaLocation
  label?: string
  compact?: boolean
  /** The pricing card sits on white; every other instance is on navy. */
  tone?: 'dark' | 'light'
}) {
  const hasPrice = (priceEgp ?? 0) > 0
  const canCheckout = CHECKOUT_ENABLED && hasPrice
  const text = label ?? offer.ctaLabelAr

  function onClick() {
    trackCtaClick({ location, courseSlug: offer.courseSlug })
  }

  const price = hasPrice ? (
    <span className="flex items-baseline gap-2">
      <span
        className={cn(
          'tabular font-display',
          tone === 'light' ? 'text-gold-600' : 'text-gold-500',
          compact ? 'text-xl' : 'text-lg',
        )}
      >
        {formatPrice(priceEgp!)}
      </span>
      {compareAtEgp && compareAtEgp > priceEgp! ? (
        <span
          className={cn(
            'tabular text-sm line-through',
            tone === 'light' ? 'text-muted' : 'text-cream-50/45',
          )}
        >
          {formatPrice(compareAtEgp)}
        </span>
      ) : null}
    </span>
  ) : null

  return (
    <div className={cn(compact ? 'flex items-center gap-3' : 'inline-flex flex-col items-center')}>
      {compact && price}

      <Button asChild size="lg" className={cn(compact ? 'flex-1' : 'px-10')}>
        {canCheckout ? (
          <Link href={offer.checkoutHref} onClick={onClick}>
            {text}
          </Link>
        ) : (
          <a
            href={whatsappLink(`السلام عليكم، عايز أحجز في ${offer.courseSlug}`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
          >
            {text}
          </a>
        )}
      </Button>

      {!compact && (
        <>
          {price && <span className="mt-3">{price}</span>}
          <span
            className={cn(
              'mt-2 text-center text-xs leading-relaxed',
              tone === 'light' ? 'text-muted' : 'text-cream-50/55',
            )}
          >
            {canCheckout ? offer.ctaSubLabelAr : 'الحجز والاستفسار عن السعر على واتساب'}
          </span>
        </>
      )}
    </div>
  )
}
