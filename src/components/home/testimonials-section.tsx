'use client'

import { useState } from 'react'

import { SectionHeading } from '@/components/ui/section-heading'
import type { Testimonial } from '@/lib/queries'
import { cn } from '@/lib/utils'

/**
 * PRD §9.2 is enforced here, not only in the database:
 *   - the source label renders under every name, and the only source that
 *     exists today is in-person training;
 *   - avatars are gold initials. No stock or AI-generated faces. A real
 *     permitted photo is used if `avatar_url` is ever set.
 *
 * Layout note: the previous version was three equal cards with five gold
 * stars on each — the shape every template ships with, and the stars added
 * nothing since every rating is 5. This sets the strongest quote as a large
 * pull-quote and lets the others sit beside it as plain attributed text.
 */
const SOURCE_LABEL: Record<Testimonial['source'], string> = {
  in_person_training: 'من التدريب الحضوري',
  online_course: 'من الدورات الأونلاين',
}

/**
 * A testimonial body holds one line per original message — these were
 * separate DMs and stories, and running them together would read as edited
 * marketing copy rather than as what someone actually sent.
 */
function messages(body: string) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
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

function Attribution({
  testimonial,
  tone = 'light',
}: {
  testimonial: Testimonial
  tone?: 'light' | 'dark'
}) {
  const onDark = tone === 'dark'

  return (
    <figcaption className="mt-5 flex items-center gap-3">
      {testimonial.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={testimonial.avatar_url}
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-full font-display text-sm',
            onDark ? 'bg-gold-500/15 text-gold-300' : 'bg-navy-900/6 text-gold-600',
          )}
        >
          {initials(testimonial.name)}
        </span>
      )}

      <span className="min-w-0">
        <span
          className={cn(
            'block truncate text-sm font-medium',
            onDark ? 'text-white' : 'text-navy-900',
          )}
        >
          {testimonial.name}
        </span>
        <span className={cn('block truncate text-xs', onDark ? 'text-cream-50/55' : 'text-muted')}>
          {SOURCE_LABEL[testimonial.source]}
        </span>
      </span>
    </figcaption>
  )
}

export function TestimonialsSection({
  testimonials,
  /**
   * `feature` — one pull-quote plus four supporting, for the homepage and
   * the sales page, where testimonials are one section among many.
   * `all` — every quote in full, for the dedicated /testimonials page,
   * where cutting the list off would be the whole point of the page missed.
   */
  layout = 'feature',
  headingAr,
  introAr,
}: {
  testimonials: Testimonial[]
  layout?: 'feature' | 'all'
  /**
   * The site is written in MSA; the VSL landing page is written in
   * Egyptian colloquial. Rather than pick one and break the register of
   * the other, the section takes an override and each page passes the
   * voice it is written in.
   */
  headingAr?: React.ReactNode
  introAr?: string
}) {
  const [index, setIndex] = useState(0)

  if (testimonials.length === 0) return null

  if (layout === 'all') {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          {/* Columns rather than a grid: quotes run from one line to four,
              and equal-height cells would leave holes under the short ones. */}
          <ul className="gap-x-12 md:columns-2 lg:columns-3">
            {testimonials.map((testimonial) => (
              <li
                key={testimonial.id}
                className="mb-10 break-inside-avoid border-t border-navy-900/10 pt-6"
              >
                <figure>
                  <blockquote className="space-y-3">
                    {messages(testimonial.body_ar).map((line, i) => (
                      <p key={i} className="text-sm leading-loose text-ink/85">
                        {line}
                      </p>
                    ))}
                  </blockquote>
                  <Attribution testimonial={testimonial} />
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  // Navigation follows the order the academy set. The pull-quote opens on
  // the longest one, though: quotes run from 50 to 380 characters, and only
  // the long ones have a story in them rather than a one-line thank-you.
  const ordered = testimonials
  const longest = ordered.reduce(
    (best, t, i) => (t.body_ar.length > ordered[best].body_ar.length ? i : best),
    0,
  )
  const active = (longest + index) % ordered.length
  const feature = ordered[active]
  const supporting = ordered.filter((t) => t.id !== feature.id).slice(0, 4)

  return (
    <section aria-labelledby="testimonials-heading" className="relative bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <SectionHeading
            id="testimonials-heading"
            kicker="آراء المتدربين"
            title={
              headingAr ?? (
                <>
                  ماذا قالوا
                  <br />
                  عن التجربة
                </>
              )
            }
          />
          <p className="max-w-md text-base leading-loose text-muted lg:pb-3">
            {introAr ??
              'كل ما يلي مقتبس من رسائل بعثها متدربون حضروا التدريب بأنفسهم. لا تقييمات مدفوعة ولا مكتوبة.'}
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Pull-quote */}
          <figure className="relative">
            <span
              className="absolute -top-10 -start-3 font-display text-[7rem] leading-none text-gold-500/15 select-none sm:-top-14 sm:text-[9rem]"
              aria-hidden="true"
            >
              »
            </span>

            <blockquote className="relative space-y-4">
              {messages(feature.body_ar).map((line, i) => (
                <p key={i} className="text-lg leading-loose text-ink/90 sm:text-xl sm:leading-loose">
                  {line}
                </p>
              ))}
            </blockquote>

            <Attribution testimonial={feature} />

            {ordered.length > 1 && (
              <div className="mt-8 flex items-center gap-2">
                {ordered.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIndex((i - longest + ordered.length) % ordered.length)}
                    aria-label={`رأي ${i + 1}`}
                    aria-current={i === active}
                    className={cn(
                      'h-px transition-all',
                      i === active ? 'w-10 bg-gold-500' : 'w-4 bg-navy-900/20 hover:bg-navy-900/45',
                    )}
                  />
                ))}
              </div>
            )}
          </figure>

          {/* Supporting voices — plain text, hairline separated. */}
          <ul className="divide-y divide-navy-900/8 border-y border-navy-900/8">
            {supporting.map((testimonial) => (
              <li key={testimonial.id} className="py-6">
                <figure>
                  <blockquote className="space-y-2">
                    {messages(testimonial.body_ar).map((line, i) => (
                      <p key={i} className="line-clamp-3 text-sm leading-loose text-ink/75">
                        {line}
                      </p>
                    ))}
                  </blockquote>
                  <figcaption className="mt-3 text-xs text-muted">
                    <span className="font-medium text-navy-900">{testimonial.name}</span>
                    {' — '}
                    {SOURCE_LABEL[testimonial.source]}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
