import { GraduationCap, MapPin, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { CoursesGrid } from '@/components/home/courses-grid'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { Button } from '@/components/ui/button'
import { academyStats, whatsappLink } from '@/config/site'
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
      {/* ---- Hero (PRD §7.1.1) ---- */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,75,0.18),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="font-display text-sm tracking-[0.3em] text-gold-500">
            أكاديمية ماري رجائي للتجميل
          </p>

          <h1 className="mx-auto mt-6 max-w-3xl text-3xl text-white sm:text-4xl md:text-5xl">
            تعلمي باحتراف
            <span className="mt-2 block text-gold-500">وابدئي مستقبلك في عالم الجمال</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-loose text-cream-50/85 sm:text-lg">
            أكاديمية متخصصة في تعليم كل ما يخص التجميل — من تسريحات الشعر والقص والصبغة والمزيد،
            بمنهج عملي احترافي من خبرة سنين.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">استكشفي الدورات</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                تواصلي معنا
              </a>
            </Button>
          </div>
        </div>
      </section>

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

      {/* ---- Courses grid (PRD §7.1.3) ---- */}
      <CoursesGrid courses={courses} categories={categories} />

      {/* ---- Why choose us (PRD §7.1.4) ---- */}
      <WhyChooseUs />

      {/* ---- Testimonials (PRD §7.1.5 / §9.2) ---- */}
      <TestimonialsSection testimonials={testimonials} />
    </>
  )
}
