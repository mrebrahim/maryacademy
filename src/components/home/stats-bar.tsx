import { academyStats } from '@/config/site'
import { cn } from '@/lib/utils'

/**
 * Stats band — PRD §7.1.2.
 *
 * Figures come from config, and each carries the in-person-training
 * qualifier PRD §9.2 requires. Set as display type rather than in icon
 * cards: these are the strongest numbers the academy has and should read as
 * a statement, not a widget row.
 *
 * Three details that were wrong on the first pass:
 *
 *  - Dividers sat on each item's *end* edge, which in RTL put a stray rule
 *    off the left of the last item. They belong on the *start* edge of
 *    items 2-4, so every rule falls between a pair and none hangs off the
 *    outside.
 *
 *  - The fourth stat is a place, not a count. It was rendering "مصر" at
 *    numeral size above "جميع أنحاء مصر", saying Egypt twice. Its label now
 *    *is* its display line, set smaller so it does not pose as a figure.
 *
 *  - Numerals and Arabic words have different vertical metrics, so the four
 *    display lines did not share a baseline. A fixed line box fixes that.
 */
export function StatsBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const onDark = tone === 'dark'

  return (
    <section
      aria-label="أرقام الأكاديمية"
      className={cn('relative', onDark ? 'grain bg-navy-900' : 'bg-ivory')}
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <dl className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {academyStats.map((stat, i) => (
            <div
              key={stat.labelAr}
              className={cn(
                i > 0 && 'lg:ps-8',
                i > 0 && (onDark ? 'lg:border-s lg:border-white/10' : 'lg:border-s lg:border-navy-900/10'),
              )}
            >
              {/* Fixed height keeps numerals and Arabic words on one baseline. */}
              <div className="flex h-14 items-end sm:h-16">
                <dd
                  className={cn(
                    'gold-text font-display leading-none',
                    stat.value ? 'tabular text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl',
                  )}
                >
                  {stat.value ?? stat.labelAr}
                </dd>
              </div>

              {/* Only labelled when there is a figure above it to label. */}
              {stat.value && (
                <dt className={cn('mt-4 text-base', onDark ? 'text-white' : 'text-navy-900')}>
                  {stat.labelAr}
                </dt>
              )}

              <p
                className={cn(
                  'text-sm',
                  stat.value ? 'mt-1' : 'mt-4',
                  onDark ? 'text-cream-50/55' : 'text-muted',
                )}
              >
                {stat.contextAr}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
