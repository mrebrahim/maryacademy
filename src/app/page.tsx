import { CoursesGrid } from '@/components/home/courses-grid'
import { CtaBand } from '@/components/home/cta-band'
import { Faq } from '@/components/home/faq'
import { Hero } from '@/components/home/hero'
import { Instructor } from '@/components/home/instructor'
import { LearningJourney } from '@/components/home/learning-journey'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { academyStats } from '@/config/site'
import { getCategories, getPublishedCourses, getTestimonials } from '@/lib/queries'

// Marketing page: rebuild hourly so content edits appear without a deploy.
export const revalidate = 3600

export default async function HomePage() {
  const [courses, categories, testimonials] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
    getTestimonials(),
  ])

  return (
    <>
      <Hero />

      {/* ---- Stats (PRD §7.1.2) ----
          Figures come from config, and each carries the in-person-training
          qualifier PRD §9.2 requires. Set as display type rather than in
          icon cards: these are the strongest numbers the academy has and
          they should read as a statement, not as a widget row. */}
      <section aria-label="أرقام الأكاديمية" className="grain relative bg-navy-900">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {academyStats.map((stat, i) => (
              <div
                key={stat.labelAr}
                className={
                  i > 0
                    ? 'lg:border-e lg:border-white/10 lg:pe-8 ltr:lg:border-s ltr:lg:border-e-0'
                    : undefined
                }
              >
                {stat.value ? (
                  <p className="tabular gold-text font-display text-5xl leading-none sm:text-6xl">
                    {stat.value}
                  </p>
                ) : (
                  <p className="gold-text font-display text-4xl leading-none sm:text-5xl">مصر</p>
                )}
                <p className="mt-4 text-base text-white">{stat.labelAr}</p>
                <p className="mt-1 text-sm text-cream-50/55">{stat.contextAr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoursesGrid courses={courses} categories={categories} />
      <LearningJourney />
      <WhyChooseUs />
      <Instructor />
      <TestimonialsSection testimonials={testimonials} />
      <Faq />
      <CtaBand />
    </>
  )
}
