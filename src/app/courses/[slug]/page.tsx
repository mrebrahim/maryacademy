import { BookOpen, Check, ChevronDown, Clock, GraduationCap, Infinity as InfinityIcon, PlayCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TestimonialsSection } from '@/components/home/testimonials-section'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { siteConfig, whatsappLink } from '@/config/site'
import { getCourseBySlug, getPublishedCourseSlugs, getTestimonials } from '@/lib/queries'
import { formatDuration, formatPrice } from '@/lib/utils'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPublishedCourseSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return {}

  return {
    title: course.seo_title ?? course.title_ar,
    description: course.seo_description ?? course.subtitle_ar ?? undefined,
    alternates: { canonical: `/courses/${course.slug}` },
  }
}

/** jsonb columns come back as `Json`; these narrow them safely. */
function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function asFaq(value: unknown): { q: string; a: string }[] {
  return Array.isArray(value)
    ? value.filter(
        (v): v is { q: string; a: string } =>
          typeof v === 'object' && v !== null && 'q' in v && 'a' in v,
      )
    : []
}

export default async function CourseSalesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [course, testimonials] = await Promise.all([getCourseBySlug(slug), getTestimonials(6)])

  if (!course) notFound()

  const whatYouLearn = asStrings(course.what_you_learn)
  const requirements = asStrings(course.requirements)
  const targetAudience = asStrings(course.target_audience)
  const painPoints = asStrings(course.pain_points)
  const faq = asFaq(course.faq)

  // The price is not set yet, so the page asks the visitor to get in touch
  // rather than displaying a placeholder number. PRD §6.1: never show or
  // trust a price that did not come from the database.
  const hasPrice = course.price_egp > 0

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title_ar,
    description: course.seo_description ?? course.subtitle_ar ?? '',
    inLanguage: 'ar',
    provider: {
      '@type': 'Organization',
      name: siteConfig.nameAr,
      sameAs: siteConfig.url,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${Math.round(course.total_duration_minutes / 60)}H`,
    },
    ...(hasPrice && {
      offers: {
        '@type': 'Offer',
        price: (course.price_egp / 100).toFixed(2),
        priceCurrency: 'EGP',
        availability: 'https://schema.org/InStock',
        url: `${siteConfig.url}/courses/${course.slug}`,
      },
    }),
    // No aggregateRating: there are no online-course ratings yet (PRD §9.2).
  }

  const faqStructuredData = faq.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_20%_0%,rgba(201,162,75,0.2),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-300">
              <span className="size-1.5 rotate-45 bg-gold-500" aria-hidden="true" />
              دورة أونلاين
            </p>

            <h1 className="mt-6 text-3xl leading-tight text-white sm:text-4xl">
              {course.title_ar}
            </h1>

            {course.subtitle_ar && (
              <p className="mt-5 max-w-2xl text-base leading-loose text-cream-50/85 sm:text-lg">
                {course.subtitle_ar}
              </p>
            )}

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-cream-50/80">
              <li className="flex items-center gap-2">
                <BookOpen className="size-4 text-gold-500" aria-hidden="true" />
                <span className="tabular">{course.lesson_count}</span> درسًا
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-gold-500" aria-hidden="true" />
                {formatDuration(course.total_duration_minutes * 60)}
              </li>
              {course.certificate_enabled && (
                <li className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-gold-500" aria-hidden="true" />
                  شهادة إتمام
                </li>
              )}
              <li className="flex items-center gap-2">
                <InfinityIcon className="size-4 text-gold-500" aria-hidden="true" />
                رجوع للدروس في أي وقت
              </li>
            </ul>
          </div>

          {/* Price / CTA card */}
          <aside className="rounded-card border border-gold-500/30 bg-navy-800 p-6 lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-video rounded-lg bg-navy-900/60 ring-1 ring-white/5">
              <div className="grid size-full place-items-center text-cream-50/40">
                <PlayCircle className="size-12" aria-hidden="true" />
              </div>
            </div>

            {hasPrice ? (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="tabular font-display text-3xl text-gold-500">
                  {formatPrice(course.price_egp)}
                </span>
                {course.compare_at_price_egp ? (
                  <span className="tabular text-base text-cream-50/50 line-through">
                    {formatPrice(course.compare_at_price_egp)}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 text-base font-semibold text-gold-300">
                للاستفسار عن السعر والحجز، تواصل معنا عبر واتساب.
              </p>
            )}

            <div className="mt-6 space-y-3">
              {hasPrice ? (
                <Button asChild size="lg" className="w-full">
                  <Link href={`/checkout/${course.slug}`}>احجز مقعدك الآن</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full">
                  <a
                    href={whatsappLink(`السلام عليكم، أرغب في معرفة تفاصيل ${course.title_ar}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    الحجز عبر واتساب
                  </a>
                </Button>
              )}

              <Button asChild variant="secondary" size="md" className="w-full">
                <Link href="/contact">لديّ استفسار</Link>
              </Button>
            </div>

            <p className="mt-5 text-center text-xs text-cream-50/60">
              الدفع عبر إنستا باي، ويُفعَّل الحساب بعد التحويل.
            </p>
          </aside>
        </div>
      </section>

      {/* ---------- Pain points ----------
          Content comes from the course record, not this template: the
          academy is adding trainers in other beauty fields, and hardcoded
          hairstyling copy would follow them onto every new sales page. */}
      {painPoints.length > 0 && (
        <section className="bg-ivory">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <SectionHeading
              kicker="المشكلة"
              title="إذا كان هذا يحدث معك، فأنت في المكان الصحيح"
              align="center"
            />
            <ul className="mt-10 space-y-4 text-start">
              {painPoints.map((pain) => (
                <li
                  key={pain}
                  className="flex items-start gap-3 rounded-card bg-white p-4 shadow-soft ring-1 ring-navy-900/5"
                >
                  <span className="mt-1 size-2 shrink-0 rotate-45 bg-gold-500" aria-hidden="true" />
                  <span className="text-sm leading-loose text-ink/85">{pain}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Curriculum ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            kicker="المنهج"
            title="محتوى الدورة"
            subtitle={`${course.lesson_count} درسًا على ${course.modules.length} أجزاء — ${formatDuration(course.total_duration_minutes * 60)}`}
          />

          <div className="mt-12 space-y-4">
            {course.modules.map((module, index) => (
              <details
                key={module.id}
                open={index === 0}
                className="group overflow-hidden rounded-card border border-navy-900/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-cream-50 px-5 py-4">
                  <span className="flex items-center gap-3">
                    <span className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-gold-500">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-navy-900">{module.title_ar}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                    <span className="tabular hidden sm:inline">{module.lessons.length} دروس</span>
                    <ChevronDown
                      className="size-5 text-gold-500 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
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

      {/* ---------- What you'll learn ---------- */}
      {whatYouLearn.length > 0 && (
        <section className="bg-navy-950">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading kicker="المخرجات" title="ماذا ستتعلم؟" tone="dark" />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {whatYouLearn.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-card border border-gold-500/20 bg-navy-800 p-4"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-cream-50/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Who it's for + requirements ---------- */}
      {(targetAudience.length > 0 || requirements.length > 0) && (
        <section className="bg-ivory">
          <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
            {targetAudience.length > 0 && (
              <div>
                <h2 className="display text-2xl text-navy-900 sm:text-3xl">هذه الدورة مناسبة لك إذا…</h2>
                <span className="mt-4 block h-px w-24 bg-gold-500/60" aria-hidden="true" />
                <ul className="mt-6 space-y-3">
                  {targetAudience.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                      <span className="text-sm leading-loose text-ink/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requirements.length > 0 && (
              <div>
                <h2 className="display text-2xl text-navy-900 sm:text-3xl">ما تحتاجه للبدء</h2>
                <span className="mt-4 block h-px w-24 bg-gold-500/60" aria-hidden="true" />
                <ul className="mt-6 space-y-3">
                  {requirements.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold-500"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-loose text-ink/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <TestimonialsSection testimonials={testimonials} />

      {/* ---------- FAQ ---------- */}
      {faq.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading kicker="أسئلة" title="أسئلة شائعة" />
            <div className="mt-12 divide-y divide-navy-900/10 border-y border-navy-900/10">
              {faq.map((item) => (
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
      )}

      {/* ---------- Sticky mobile buy bar (PRD §7.2.11) ---------- */}
      <div className="sticky bottom-0 z-40 border-t border-gold-500/25 bg-navy-900/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          {hasPrice ? (
            <span className="tabular font-display text-xl text-gold-500">
              {formatPrice(course.price_egp)}
            </span>
          ) : (
            <span className="text-sm text-cream-50/80">للاستفسار عن السعر</span>
          )}

          <Button asChild size="md" className="flex-1">
            {hasPrice ? (
              <Link href={`/checkout/${course.slug}`}>احجز الآن</Link>
            ) : (
              <a
                href={whatsappLink(`السلام عليكم، أرغب في معرفة تفاصيل ${course.title_ar}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                الحجز عبر واتساب
              </a>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
