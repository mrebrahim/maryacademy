import { cn } from '@/lib/utils'

/**
 * One heading plus its paragraphs, on the legal pages.
 *
 * A component rather than repeated markup because these two pages are
 * long, change rarely, and get edited by whoever is nearest a deadline —
 * the less structure there is to re-type, the less likely one section
 * ends up looking like it belongs to a different site.
 */

/** Bumped by hand when the wording changes, not on every deploy. */
export const LEGAL_UPDATED_AR = 'آخر تحديث: 21 أكتوبر 2026'

export function LegalSection({
  title,
  children,
  last = false,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <section
      className={cn(
        'mt-10 border-t border-navy-900/10 pt-8',
        last && 'mb-0',
      )}
    >
      <h2 className="display text-xl text-navy-900">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-loose text-ink/85">{children}</div>
    </section>
  )
}
