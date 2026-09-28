'use client'

import { useEffect, useRef, useState } from 'react'

import { LandingCta } from '@/components/landing/landing-cta'
import { trackScrollDepth, trackViewContent } from '@/lib/analytics'
import { offer } from '@/config/offer'
import { cn } from '@/lib/utils'

/**
 * Two things that have to run in the browser, kept together so the page
 * itself stays a server component.
 *
 * The sticky bar appears once the hero has scrolled away and hides again
 * when the pricing section's own button is on screen — two identical
 * buttons visible at once reads as a bug rather than as emphasis.
 *
 * Scroll depth fires each threshold once. A listener that re-fires makes
 * the funnel unreadable, which is worse than not measuring at all.
 */
export function LandingClient({
  priceEgp,
  compareAtEgp,
}: {
  priceEgp: number | null
  compareAtEgp: number | null
}) {
  const [show, setShow] = useState(false)
  const fired = useRef<Set<number>>(new Set())

  useEffect(() => {
    trackViewContent({ courseSlug: offer.courseSlug })
  }, [])

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return

      const percent = (window.scrollY / scrollable) * 100

      for (const threshold of [50, 90] as const) {
        if (percent >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold)
          trackScrollDepth(threshold)
        }
      }

      // Past the fold, and not yet at the pricing block.
      const hero = document.getElementById('lp-hero')
      const pricingCta = document.getElementById('pricing-cta')

      const pastHero = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600
      const pricingVisible = pricingCta
        ? pricingCta.getBoundingClientRect().top < window.innerHeight &&
          pricingCta.getBoundingClientRect().bottom > 0
        : false

      setShow(pastHero && !pricingVisible)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!priceEgp || priceEgp <= 0) return null

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/20 bg-navy-950/95 px-4 py-3 backdrop-blur transition-transform duration-200 md:hidden',
          show ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto max-w-md">
          <LandingCta
            priceEgp={priceEgp}
            compareAtEgp={compareAtEgp}
            location="sticky"
            label="اشترك دلوقتي"
            compact
          />
        </div>
      </div>

      {/* Keeps the last section clear of the fixed bar. */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  )
}
