import { formatPrice } from '@/lib/utils'

/**
 * The two-price line: one figure for Egyptians, another for everyone else.
 *
 * One component rather than the same sentence written into the landing
 * page, the course page and checkout — three copies is how a site ends up
 * quoting two different prices on two different screens, and the one the
 * buyer saw is the one they will argue for.
 *
 * It renders nothing when there is no international price, so a course
 * that is only sold in Egypt simply does not mention it.
 */
export function PriceNote({
  priceEgpIntl,
  tone = 'light',
  className,
}: {
  priceEgpIntl: number | null | undefined
  tone?: 'light' | 'dark'
  className?: string
}) {
  if (!priceEgpIntl || priceEgpIntl <= 0) return null

  return (
    <p
      className={[
        'text-sm leading-relaxed',
        tone === 'dark' ? 'text-cream-50/70' : 'text-muted',
        className ?? '',
      ].join(' ')}
    >
      السعر ده للمصريين. لغير المصريين:{' '}
      <span className="tabular font-semibold">{formatPrice(priceEgpIntl)}</span> أو ما يعادلها
      بعملتك.
    </p>
  )
}
