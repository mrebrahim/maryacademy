'use client'

import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useState } from 'react'

import { SectionHeading } from '@/components/ui/section-heading'
import type { Testimonial } from '@/lib/queries'
import { cn } from '@/lib/utils'

/**
 * PRD §9.2 is enforced here, not just in the database:
 *   - the source label is rendered under every name, and the only source
 *     that exists today is in-person training;
 *   - avatars are gold initials circles. No stock or AI-generated faces.
 *     If a real, permitted photo is ever added, `avatar_url` is used.
 */
const SOURCE_LABEL: Record<Testimonial['source'], string> = {
  in_person_training: 'متدربة في الكورسات الحضورية',
  online_course: 'خريجة الكورس الأونلاين',
}

function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} من 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('size-4', i < rating ? 'fill-gold-500 text-gold-500' : 'text-gold-500/25')}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
      <Stars rating={testimonial.rating} />

      <blockquote className="mt-4 flex-1 text-sm leading-loose text-ink/85">
        «{testimonial.body_ar}»
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-gold-500/20 pt-4">
        {testimonial.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.avatar_url}
            alt=""
            className="size-12 shrink-0 rounded-full object-cover"
            width={48}
            height={48}
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-500/15 font-display text-base text-gold-500"
          >
            {initials(testimonial.name)}
          </span>
        )}

        <span className="min-w-0">
          <span className="block truncate font-semibold text-navy-900">{testimonial.name}</span>
          <span className="block truncate text-xs text-muted">
            {SOURCE_LABEL[testimonial.source]}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [page, setPage] = useState(0)
  const perPage = 3
  const pageCount = Math.max(1, Math.ceil(testimonials.length / perPage))

  if (testimonials.length === 0) return null

  const visible = testimonials.slice(page * perPage, page * perPage + perPage)
  const go = (delta: number) => setPage((p) => (p + delta + pageCount) % pageCount)

  return (
    <section aria-labelledby="testimonials-heading" className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          title="اللي بيقولوه عننا"
          subtitle="كلام متدربات حضروا الورش الحضورية بنفسهم — مش تقييمات مدفوعة ولا مكتوبة."
        />

        <div className="mt-12 flex items-stretch gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="السابق"
            disabled={pageCount === 1}
            className="my-auto hidden size-11 shrink-0 place-items-center rounded-full bg-white text-navy-900 shadow-soft transition hover:bg-gold-500 hover:text-navy-900 disabled:opacity-30 sm:grid"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          <ul className="grid flex-1 gap-6 md:grid-cols-3">
            {visible.map((testimonial) => (
              <li key={testimonial.id}>
                <Card testimonial={testimonial} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="التالي"
            disabled={pageCount === 1}
            className="my-auto hidden size-11 shrink-0 place-items-center rounded-full bg-white text-navy-900 shadow-soft transition hover:bg-gold-500 hover:text-navy-900 disabled:opacity-30 sm:grid"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        </div>

        {pageCount > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`الصفحة ${i + 1}`}
                aria-current={i === page}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === page ? 'w-6 bg-gold-500' : 'w-2 bg-navy-900/20 hover:bg-navy-900/40',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
