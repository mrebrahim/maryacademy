import { GraduationCap, MapPin, Trophy, Users } from 'lucide-react'
import type { ComponentType } from 'react'

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

const STAT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  graduation: GraduationCap,
  users: Users,
  trophy: Trophy,
  pin: MapPin,
}

export default async function HomePage() {
  const [courses, categories, testimonials] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
    getTestimonials(),
  ])

  return (
    <>
      <Hero />

      {/* ---- Stats bar (PRD §7.1.2) ----
          Values come from config, and every figure carries the
          in-person-training label required by PRD §9.2. */}
      <section aria-label="أرقام الأكاديمية" className="border-y border-gold-500/20 bg-navy-800">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-gold-500/20 rtl:lg:divide-x-reverse">
          {academyStats.map((stat) => {
            const Icon = STAT_ICONS[stat.icon]
            return (
              <div key={stat.labelAr} className="flex items-center justify-center gap-4">
                <Icon className="size-9 shrink-0 text-gold-500" aria-hidden="true" />
                <div className="text-start">
                  {stat.value && (
                    <p className="tabular font-display text-2xl text-gold-500 sm:text-3xl">
                      {stat.value}
                    </p>
                  )}
                  <p className="font-semibold text-white">{stat.labelAr}</p>
                  <p className="mt-0.5 text-sm text-cream-50/65">{stat.contextAr}</p>
                </div>
              </div>
            )
          })}
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
