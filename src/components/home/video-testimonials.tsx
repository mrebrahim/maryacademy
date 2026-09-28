import { Video } from 'lucide-react'

import { SectionHeading } from '@/components/ui/section-heading'
import type { Testimonial } from '@/lib/queries'

/**
 * Trainees on camera.
 *
 * A written quote can be written by anyone; a face saying it cannot. This
 * is the strongest proof the page carries, which is why it sits directly
 * under the payment form as well as on the landing page.
 *
 * Videos are Bunny GUIDs, not file URLs — same embed as the course, so a
 * link lifted from the page is not a permanent public copy of somebody's
 * face. A testimonial with no `video_id` is skipped rather than rendered
 * as an empty frame.
 */
export function VideoTestimonials({
  testimonials,
  headingAr = 'متدربين بيتكلموا',
  introAr,
  tone = 'light',
}: {
  testimonials: Testimonial[]
  headingAr?: string
  introAr?: string
  tone?: 'light' | 'dark'
}) {
  const withVideo = testimonials.filter((t) => t.video_id)
  if (withVideo.length === 0) return null

  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID

  return (
    <section
      aria-labelledby="video-testimonials"
      className={tone === 'dark' ? 'bg-navy-950' : 'bg-ivory'}
    >
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          id="video-testimonials"
          kicker="آراء بالفيديو"
          title={headingAr}
          subtitle={introAr}
          align="center"
          tone={tone}
        />

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {withVideo.map((t) => (
            <li key={t.id}>
              <figure>
                <div className="relative aspect-[9/16] overflow-hidden rounded-card bg-navy-900 ring-1 ring-gold-500/20">
                  {libraryId ? (
                    <iframe
                      src={`https://iframe.mediadelivery.net/embed/${libraryId}/${t.video_id}?autoplay=false&preload=false`}
                      title={`رأي ${t.name}`}
                      loading="lazy"
                      allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 size-full border-0"
                    />
                  ) : (
                    // The library id is not configured yet. Say so plainly
                    // rather than rendering a broken player.
                    <div className="absolute inset-0 grid place-items-center px-4 text-center">
                      <div className="text-cream-50/45">
                        <Video className="mx-auto size-8" aria-hidden="true" />
                        <p className="mt-2 text-xs">مشغّل الفيديو مش متظبط</p>
                      </div>
                    </div>
                  )}
                </div>

                <figcaption className="mt-3 text-center">
                  <p
                    className={
                      tone === 'dark' ? 'text-sm text-white' : 'text-sm text-navy-900'
                    }
                  >
                    {t.name}
                  </p>
                  {t.role_ar && (
                    <p
                      className={
                        tone === 'dark'
                          ? 'mt-0.5 text-xs text-cream-50/55'
                          : 'mt-0.5 text-xs text-muted'
                      }
                    >
                      {t.role_ar}
                    </p>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
