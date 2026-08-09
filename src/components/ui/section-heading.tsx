import { cn } from '@/lib/utils'

/**
 * The mockup's section header: a thin gold hairline running out from a
 * diamond glyph on both sides of the title (PRD §3, shape language).
 */
export function SectionHeading({
  title,
  subtitle,
  tone = 'light',
  className,
  as: Tag = 'h2',
}: {
  title: string
  subtitle?: string
  tone?: 'light' | 'dark'
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  const onDark = tone === 'dark'

  return (
    <div className={cn('text-center', className)}>
      <Tag
        className={cn(
          'text-2xl sm:text-3xl md:text-4xl',
          onDark ? 'text-white' : 'text-navy-900',
        )}
      >
        {title}
      </Tag>

      <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-12 bg-gold-500/60 sm:w-20" />
        <span className="size-2 rotate-45 bg-gold-500" />
        <span className="h-px w-12 bg-gold-500/60 sm:w-20" />
      </div>

      {subtitle && (
        <p
          className={cn(
            'mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg',
            onDark ? 'text-cream-50/80' : 'text-muted',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
