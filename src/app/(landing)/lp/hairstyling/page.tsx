import { BookOpen, Check, ChevronDown, Clock, GraduationCap, PlayCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { LandingCta } from '@/components/landing/landing-cta'
import { LeadCapture } from '@/components/landing/lead-capture'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { SectionHeading } from '@/components/ui/section-heading'
import { landingCopy } from '@/config/landing/hairstyling'
import { whatsappLink } from '@/config/site'
import { getCourseBySlug, getTestimonials } from '@/lib/queries'
import { formatDuration } from '@/lib/utils'

const COURSE_SLUG = 'hairstyling-master-class'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'كورس تصفيف الشعر الاحترافي أونلاين',
  description: landingCopy.hero.sub,
  // Paid-traffic landing pages should not compete with the course page in
  // organic search, and they have no business being crawled at all.
  robots: { index: false, follow: false },
}

export default async function HairstylingLandingPage() {
  const [course, testimonials] = await Promise.all([
    getCourseBySlug(COURSE_SLUG),
    getTestimonials(8),
  ])

  if (!course) notFound()

  const c = landingCopy

  return (
    <>
      {/* ---------- Hero + VSL ---------- */}
      <section className="grain relative overflow-hidden bg-navy-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(201,162,75,0.2),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="kicker flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold-500/70" aria-hidden="true" />
            {c.hero.kicker}
          </p>

          <h1 className="display mt-5 text-[1.75rem] text-white sm:text-4xl lg:text-5xl">
            {c.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-loose text-cream-50/80">
            {c.hero.sub}
          </p>

          {/* The video is the page. Everything below it exists to be read
              only by people the video did not already convince. */}
          <div className="mt-9 overflow-hidden rounded-card ring-1 ring-gold-500/25">
            {c.vslVideoId ? (
              <div className="aspect-video">
                <iframe
                  src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${c.vslVideoId}?autoplay=false`}
                  title={c.hero.headline}
                  loading="lazy"
                  allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            ) : (
              <div className="grid aspect-video place-items-center bg-navy-900">
                <div className="text-center text-cream-50/40">
                  <PlayCircle className="mx-auto size-14" aria-hidden="true" />
                  <p className="mt-3 text-sm">مكان فيديو الشرح</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <LandingCta course={course} label={c.hero.cta} />
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-cream-50/70">
            <li className="flex items-center gap-2">
              <BookOpen className="size-4 text-gold-500" aria-hidden="true" />
              <span className="tabular">{course.lesson_count}</span> درس
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-gold-500" aria-hidden="true" />
              {formatDuration(course.total_duration_minutes * 60)}
            </li>
            <li className="flex items-center gap-2">
              <GraduationCap className="size-4 text-gold-500" aria-hidden="true" />
              شهادة إتمام
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Pain, in their own words ---------- */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="لو ده بيحصل معاك" title="إنت مش لوحدك" align="center" />
          <ul className="mt-10 space-y-3">
            {c.painQuotes.map((quote) => (
              <li
                key={quote}
                className="rounded-card bg-white px-5 py-4 text-sm leading-loose text-ink/85 shadow-soft ring-1 ring-navy-900/5"
              >
                «{quote}»
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-muted">
            الجُمل دي مش مكتوبة — دي رسايل بتوصل لماري كل أسبوع.
          </p>
        </div>
      </section>

      {/* ---------- The reframe ---------- */}
      <section className="grain relative bg-navy-900">
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <SectionHeading kicker="السبب الحقيقي" title={c.reframe.title} tone="dark" align="center" />
          <p className="mx-auto mt-9 max-w-2xl text-lg leading-loose text-gold-300 sm:text-xl">
            «{c.reframe.quote}»
          </p>
          {c.reframe.body.map((para) => (
            <p key={para} className="mx-auto mt-5 max-w-2xl text-base leading-loose text-cream-50/75">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ---------- Outcomes ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="بعد الكورس" title="اللي هيتغيّر فعلًا" align="center" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {c.outcomes.map((item) => (
              <li key={item.titleAr} className="border-t border-navy-900/10 pt-5">
                <h3 className="text-lg text-navy-900">{item.titleAr}</h3>
                <p className="mt-2 text-sm leading-loose text-muted">{item.bodyAr}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex justify-center">
            <LandingCta course={course} label={c.hero.cta} />
          </div>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="لمين" title="الكورس ده ليك لو…" align="center" />
          <ul className="mt-10 space-y-4">
            {c.audience.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                <span className="text-base leading-loose text-ink/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Curriculum ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            kicker="المحتوى"
            title="اللي جوّه الكورس"
            subtitle={`${course.lesson_count} درسًا على ${course.modules.length} أجزاء — ${formatDuration(course.total_duration_minutes * 60)}`}
            align="center"
          />

          <div className="mt-12 space-y-4">
            {course.modules.map((module, index) => (
              <details
                key={module.id}
                open={index === 0}
                className="group overflow-hidden rounded-card border border-navy-900/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-ivory px-5 py-4">
                  <span className="flex items-center gap-3">
                    <span className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-gold-500">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-navy-900">{module.title_ar}</span>
                  </span>
                  <ChevronDown
                    className="size-5 shrink-0 text-gold-500 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="divide-y divide-navy-900/5">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <PlayCircle className="size-4 shrink-0 text-gold-500" aria-hidden="true" />
                        <span className="truncate text-sm text-ink/85">{lesson.title_ar}</span>
                      </span>
                      <span className="tabular shrink-0 text-xs text-muted">
                        {formatDuration(lesson.duration_seconds ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Mechanism ---------- */}
      <section className="grain relative bg-navy-950">
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="الفرق" title={c.mechanism.title} tone="dark" align="center" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {c.mechanism.items.map((item) => (
              <li key={item.titleAr} className="border-t border-white/10 pt-5">
                <h3 className="text-lg text-gold-300">{item.titleAr}</h3>
                <p className="mt-2 text-sm leading-loose text-cream-50/70">{item.bodyAr}</p>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-card border border-gold-500/30 bg-navy-900 p-7 text-center">
            <p className="kicker flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold-500/70" aria-hidden="true" />
              {c.proof.title}
            </p>
            <p className="mt-4 text-lg leading-loose text-white sm:text-xl">{c.proof.body}</p>
          </div>
        </div>
      </section>

      <TestimonialsSection testimonials={testimonials} />

      {/* ---------- Objections ---------- */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="بصراحة" title="الاعتراضات اللي بتتقال" align="center" />
          <ul className="mt-10 space-y-6">
            {c.objections.map((item) => (
              <li key={item.q} className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
                <p className="font-semibold text-navy-900">«{item.q}»</p>
                <p className="mt-3 text-sm leading-loose text-muted">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Founder ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="المؤسِّسة" title={c.founder.title} align="center" />
          <div className="mt-10 space-y-5">
            {c.founder.body.map((para) => (
              <p key={para} className="text-base leading-loose text-ink/80">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="أسئلة" title="اللي بيتسأل قبل الحجز" align="center" />
          <div className="mt-10 divide-y divide-navy-900/10 border-y border-navy-900/10">
            {c.faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-semibold text-navy-900">{item.q}</span>
                  <ChevronDown
                    className="size-5 shrink-0 text-gold-500 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 pe-9 text-sm leading-loose text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LeadCapture courseId={course.id} />

      {/* ---------- Close ---------- */}
      <section className="grain relative overflow-hidden bg-navy-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(201,162,75,0.2),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h2 className="display text-3xl text-white sm:text-4xl">{c.finalCta.title}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-loose text-cream-50/80">
            {c.finalCta.body}
          </p>

          <div className="mt-9 flex justify-center">
            <LandingCta course={course} label={c.finalCta.cta} />
          </div>

          <p className="mt-6">
            <a
              href={whatsappLink('السلام عليكم، عندي سؤال عن كورس تصفيف الشعر')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cream-50/60 underline underline-offset-4 hover:text-gold-300"
            >
              {c.finalCta.secondary}
            </a>
          </p>
        </div>
      </section>

      {/* Sticky mobile bar — the CTA should never be more than a thumb away. */}
      <div className="sticky bottom-0 z-40 border-t border-gold-500/25 bg-navy-950/95 p-3 backdrop-blur lg:hidden">
        <LandingCta course={course} label={c.hero.cta} compact />
      </div>

      <p className="bg-navy-950 pb-6 text-center text-xs text-cream-50/40">
        <Link href="/courses/hairstyling-master-class" className="hover:text-gold-300">
          صفحة الكورس الكاملة
        </Link>
      </p>
    </>
  )
}
