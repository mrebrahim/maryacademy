import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { CourseDetail } from '@/lib/queries'
import { whatsappLink } from '@/config/site'
import { cn, formatPrice } from '@/lib/utils'

/**
 * The landing page's single call to action, repeated down the page.
 *
 * Price behaviour matches the rest of the site: the online price is not set
 * yet, so rather than invent one or leave a blank, the button routes to
 * WhatsApp — which is where Marie already closes every sale today. The
 * moment `price_egp` is set in the database the same component starts
 * showing the price and pointing at checkout, with no edit here.
 */
export function LandingCta({
  course,
  label,
  compact = false,
}: {
  course: CourseDetail
  label: string
  compact?: boolean
}) {
  const hasPrice = course.price_egp > 0

  if (!hasPrice) {
    return (
      <div className={cn(!compact && 'inline-flex flex-col items-center')}>
        <Button asChild size="lg" className={cn(compact ? 'w-full' : 'px-10')}>
          <a
            href={whatsappLink(`السلام عليكم، عايز أحجز في ${course.title_ar}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        </Button>
        {!compact && (
          <span className="mt-3 text-xs text-cream-50/55">الحجز والاستفسار عن السعر على واتساب</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn(compact ? 'flex items-center gap-3' : 'inline-flex flex-col items-center')}>
      {compact && (
        <span className="tabular font-display text-xl text-gold-500">
          {formatPrice(course.price_egp)}
        </span>
      )}

      <Button asChild size="lg" className={cn(compact ? 'flex-1' : 'px-10')}>
        <Link href={`/checkout/${course.slug}`}>{label}</Link>
      </Button>

      {!compact && (
        <span className="mt-3 flex items-baseline gap-2 text-sm text-cream-50/70">
          <span className="tabular font-display text-lg text-gold-500">
            {formatPrice(course.price_egp)}
          </span>
          {course.compare_at_price_egp ? (
            <span className="tabular text-cream-50/45 line-through">
              {formatPrice(course.compare_at_price_egp)}
            </span>
          ) : null}
        </span>
      )}
    </div>
  )
}
