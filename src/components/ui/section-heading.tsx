import { cn } from '@/lib/utils'

/**
 * Section heading.
 *
 * Deliberately *not* a centred title with the same ornament under it every
 * time — repeating one motif nine times down a page is what makes a layout
 * feel machine-assembled. The default is start-aligned with a gold kicker
 * and a rule that runs off toward the margin; `align="center"` exists for
 * the one or two moments that genuinely want to be symmetrical.
 */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  tone = 'light',
  align = 'start',
  className,
  as: Tag = 'h2',
  id,
}: {
  kicker?: string
  title: React.ReactNode
  subtitle?: string
  tone?: 'light' | 'dark'
  align?: 'start' | 'center'
  className?: string
  as?: 'h1' | 'h2' | 'h3'
  id?: string
}) {
  const onDark = tone === 'dark'
  const centered = align === 'center'

  return (
    <div className={cn(centered && 'text-center', className)}>
      {kicker && (
        <p className={cn('kicker flex items-center gap-3', centered && 'justify-center')}>
          <span className="h-px w-8 bg-gold-500/70" aria-hidden="true" />
          {kicker}
        </p>
      )}

      <Tag
        id={id}
        className={cn(
          'display mt-4 text-[1.75rem] sm:text-4xl lg:text-[2.75rem]',
          onDark ? 'text-white' : 'text-navy-900',
        )}
      >
        {title}
      </Tag>

      {subtitle && (
        <p
          className={cn(
            'mt-5 max-w-xl text-base leading-loose',
            centered && 'mx-auto',
            onDark ? 'text-cream-50/75' : 'text-muted',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
