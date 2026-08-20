import { Award, Check, MessageCircle, PlayCircle, Repeat, Users, X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { StatsBar } from '@/components/home/stats-bar'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { plans } from '@/config/plans'
import { siteConfig, whatsappLink } from '@/config/site'
import { getCourseBySlug, getPublishedCourses, getTestimonials } from '@/lib/queries'
import { cn, formatDuration, formatPrice } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'الأسعار والاشتراك',
  description:
    'باقات الاشتراك في أكاديمية ماري رجائي للتجميل — دورة واحدة أو باقة الأكاديمية الكاملة، مع شهادة إتمام ودروس معاينة مفتوحة قبل الحجز.',
}

const BOOKING_MESSAGE = 'أريد الاشتراك بالكورسات'

/** What the page promises, kept out of the JSX so the copy is editable in one place. */
const VALUE_CARDS = [
  {
    icon: Award,
    titleAr: 'شهادة إتمام باسمك',
    bodyAr: 'بعد آخر درس تصدر الشهادة تلقائيًا برقم تسلسلي يخص حسابك.',
  },
  {
    icon: Repeat,
    titleAr: 'تعيد أي درس وقت ما تحب',
    bodyAr: 'التدريب الحضوري بيعدّي مرة واحدة. هنا ترجع للخطوة الصعبة لحد ما تتقنها.',
  },
  {
    icon: Users,
    titleAr: 'مجتمع للأسئلة والنقاش',
    bodyAr: 'مساحة مخصصة لمشتركي الدورة، أسئلتها ومصادرها تتراجع من الأكاديمية.',
  },
] as const

/** The comparison block: what stops people, and the answer to each. */
const OBJECTIONS = [
  {
    problemAr: 'الكورسات الحضورية غالية، ووقتها ثابت مش بيناسب شغلي.',
    answerAr: 'الدورة أونلاين بالكامل — تفتحها في وقتك، من أي جهاز، وتعيد أي جزء.',
  },
  {
    problemAr: 'اشتريت كورس قبل كده وطلع كلام نظري مش بينفع في الشغل.',
    answerAr: 'الدورة مبنية على تدريب حضوري اتعمل فعليًا لأكثر من 400 متدرب ومتدربة.',
  },
  {
    problemAr: 'مش عارف المحتوى كويس ولا لأ قبل ما أدفع.',
    answerAr: 'فيه دروس معاينة مفتوحة تتفرّج عليها كاملة من غير حساب ومن غير دفع.',
  },
] as const

export default async function PricingPage() {
  const [courses, testimonials] = await Promise.all([getPublishedCourses(), getTestimonials(6)])

  // The headline price comes from the course row — never from a number
  // typed into the front end, which drifts from what checkout charges.
  const course = courses[0]
  const detail = course ? await getCourseBySlug(course.slug) : null

  const previews = (detail?.modules ?? [])
    .flatMap((module) => module.lessons)
    .filter((lesson) => lesson.is_free_preview)
    .slice(0, 3)

  const price = course?.price_egp ?? null
  const compareAt = course?.compare_at_price_egp ?? null
  const saving = price && compareAt && compareAt > price ? compareAt - price : null

  return (
    <>
      {/* ================= Hero ================= */}
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <p className="font-display text-sm tracking-[0.2em] text-gold-300 uppercase">
            {siteConfig.nameEn}
          </p>

          <h1 className="display mx-auto mt-6 max-w-2xl text-3xl leading-tight sm:text-4xl">
            اتعلّم مهنة التجميل من الأول للاحتراف — <span className="text-gold-300">وابدأ تشتغل</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl leading-loose text-cream-50/70">
            نفس المنهج اللي اتدرّب عليه أكثر من 400 متدرب ومتدربة حضوريًا، مسجّل بالفيديو ومتاح
            تفتحه في وقتك.
          </p>

          {/* ---- Price anchor ---- */}
          {price && (
            <div className="mx-auto mt-10 max-w-md rounded-card bg-white/5 p-7 ring-1 ring-gold-500/25 backdrop-blur">
              <div className="flex items-baseline justify-center gap-3">
                <span className="tabular display text-4xl text-gold-300">{formatPrice(price)}</span>
                {compareAt && compareAt > price && (
                  <span className="tabular text-base text-cream-50/40 line-through">
                    {formatPrice(compareAt)}
                  </span>
                )}
              </div>

              {saving && (
                <p className="tabular mt-2 text-sm text-gold-300">
                  توفّر {formatPrice(saving)} عن السعر الأساسي
                </p>
              )}

              <p className="mt-1 text-xs text-cream-50/55">دفعة واحدة للدورة</p>

              <Button asChild size="lg" className="mt-6 w-full">
                <a href={whatsappLink(BOOKING_MESSAGE)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  تواصل مع الفريق للحجز
                </a>
              </Button>

              <p className="mt-3 text-xs text-cream-50/50">
                الفريق يرد عليك على واتساب ويكمّل معك خطوات الحجز
              </p>
            </div>
          )}

          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cream-50/60">
            {['شهادة إتمام باسمك', 'دروس معاينة مفتوحة', 'من أي جهاز', 'دفع بإنستا باي'].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-gold-500" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* ================= Try before you buy ================= */}
      {previews.length > 0 && course && (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
            <SectionHeading
              kicker="ابدأ من هنا"
              title="اتفرّج قبل ما تدفع"
              subtitle="دروس كاملة مفتوحة للجميع — من غير حساب ومن غير اشتراك."
            />

            <ul className="mt-12 grid gap-5 sm:grid-cols-3">
              {previews.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/watch/${course.slug}/${lesson.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card bg-cream-50 ring-1 ring-navy-900/8 transition hover:-translate-y-1 hover:shadow-soft hover:ring-gold-500/40"
                  >
                    <div className="relative aspect-video bg-gradient-to-bl from-navy-800 via-navy-900 to-navy-900">
                      <div
                        className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#C9A24B_0,#C9A24B_1px,transparent_1px,transparent_11px)]"
                        aria-hidden="true"
                      />
                      <PlayCircle
                        className="absolute start-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 text-gold-500/70 transition-transform duration-300 group-hover:scale-110 rtl:translate-x-1/2"
                        aria-hidden="true"
                      />
                      <span className="absolute end-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-navy-900">
                        معاينة مجانية
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-sm leading-relaxed text-navy-900">{lesson.title_ar}</h3>
                      <p className="tabular mt-auto pt-3 text-xs text-muted">
                        {formatDuration(lesson.duration_seconds ?? 0)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ================= Proof ================= */}
      <StatsBar tone="dark" />

      {/* ================= What you get ================= */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
          <ul className="grid gap-6 sm:grid-cols-3">
            {VALUE_CARDS.map((card) => (
              <li
                key={card.titleAr}
                className="rounded-card bg-white p-7 shadow-soft ring-1 ring-navy-900/5"
              >
                <card.icon className="size-7 text-gold-500" aria-hidden="true" />
                <h3 className="mt-5 text-base text-navy-900">{card.titleAr}</h3>
                <p className="mt-2 text-sm leading-loose text-muted">{card.bodyAr}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= Plans ================= */}
      <section id="plans" className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            kicker="الباقات"
            title="اختر الباقة اللي تناسبك"
            subtitle="الحجز بيتم مع الفريق على واتساب، والدفع بإنستا باي."
          />

          <ul className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {plans.map((plan) => {
              const priceEgp = plan.fromCourse ? (course?.price_egp ?? null) : null
              const compareEgp = plan.fromCourse ? (course?.compare_at_price_egp ?? null) : null

              return (
                <li key={plan.id}>
                  <article
                    className={cn(
                      'flex h-full flex-col rounded-card p-8 transition',
                      plan.featured
                        ? 'bg-navy-950 text-white shadow-lg ring-1 ring-gold-500/40'
                        : 'bg-cream-50 text-navy-900 ring-1 ring-navy-900/8',
                    )}
                  >
                    {plan.featured && (
                      <span className="mb-5 inline-flex w-fit rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-navy-900">
                        الأكثر طلبًا
                      </span>
                    )}

                    <h3
                      className={cn(
                        'font-display text-lg',
                        plan.featured ? 'text-gold-300' : 'text-navy-900',
                      )}
                    >
                      {plan.nameEn}
                    </h3>
                    <p
                      className={cn(
                        'display mt-1 text-2xl',
                        plan.featured ? 'text-white' : 'text-navy-900',
                      )}
                    >
                      {plan.nameAr}
                    </p>

                    <p
                      className={cn(
                        'mt-4 text-sm leading-loose',
                        plan.featured ? 'text-cream-50/70' : 'text-muted',
                      )}
                    >
                      {plan.taglineAr}
                    </p>

                    <div
                      className={cn(
                        'mt-7 border-t pt-7',
                        plan.featured ? 'border-white/10' : 'border-navy-900/10',
                      )}
                    >
                      {priceEgp ? (
                        <>
                          <p className="flex items-baseline gap-3">
                            <span
                              className={cn(
                                'tabular display text-4xl',
                                plan.featured ? 'text-gold-300' : 'text-navy-900',
                              )}
                            >
                              {formatPrice(priceEgp)}
                            </span>
                            {compareEgp && compareEgp > priceEgp && (
                              <span
                                className={cn(
                                  'tabular text-sm line-through',
                                  plan.featured ? 'text-cream-50/40' : 'text-muted',
                                )}
                              >
                                {formatPrice(compareEgp)}
                              </span>
                            )}
                          </p>
                          <p
                            className={cn(
                              'mt-2 text-xs',
                              plan.featured ? 'text-cream-50/55' : 'text-muted',
                            )}
                          >
                            دفعة واحدة للدورة
                          </p>
                        </>
                      ) : (
                        <>
                          <p
                            className={cn(
                              'display text-2xl',
                              plan.featured ? 'text-gold-300' : 'text-navy-900',
                            )}
                          >
                            تواصل معنا
                          </p>
                          <p
                            className={cn(
                              'mt-2 text-xs',
                              plan.featured ? 'text-cream-50/55' : 'text-muted',
                            )}
                          >
                            السعر بيتحدد على حسب الدورات اللي تختارها
                          </p>
                        </>
                      )}
                    </div>

                    <ul
                      className={cn(
                        'mt-7 space-y-3 text-sm',
                        plan.featured ? 'text-cream-50/85' : 'text-navy-900/85',
                      )}
                    >
                      {plan.featuresAr.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 leading-relaxed">
                          <Check className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto w-full pt-8">
                      <Button
                        asChild
                        size="lg"
                        variant={plan.featured ? 'primary' : 'tertiary'}
                        className="w-full"
                      >
                        <a
                          href={whatsappLink(plan.whatsappMessageAr)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle aria-hidden="true" />
                          {plan.ctaAr}
                        </a>
                      </Button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ================= Objections ================= */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading kicker="قبل ما تقرر" title="اللي بيوقّف الناس عادةً" />

          <ul className="mt-12 space-y-4">
            {OBJECTIONS.map((item) => (
              <li
                key={item.problemAr}
                className="grid gap-4 rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:grid-cols-2 sm:gap-8"
              >
                <p className="flex items-start gap-3 text-sm leading-loose text-muted">
                  <X className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
                  {item.problemAr}
                </p>
                <p className="flex items-start gap-3 border-t border-navy-900/8 pt-4 text-sm leading-loose text-navy-900 sm:border-t-0 sm:border-s sm:ps-8 sm:pt-0">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                  {item.answerAr}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= Testimonials ================= */}
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}

      {/* ================= Close ================= */}
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <h2 className="display text-2xl sm:text-3xl">جاهز تبدأ؟</h2>
          <p className="mx-auto mt-5 max-w-lg leading-loose text-cream-50/70">
            كلّم الفريق على واتساب، وهنكمّل معك خطوات الحجز والدفع خطوة بخطوة.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href={whatsappLink(BOOKING_MESSAGE)} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                تواصل مع الفريق للحجز
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/courses">تصفّح الدورات</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
