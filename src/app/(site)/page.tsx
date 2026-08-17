import { CoursesGrid } from '@/components/home/courses-grid'
import { CtaBand } from '@/components/home/cta-band'
import { Faq } from '@/components/home/faq'
import { Hero } from '@/components/home/hero'
import { Instructor } from '@/components/home/instructor'
import { LearningJourney } from '@/components/home/learning-journey'
import { StatsBar } from '@/components/home/stats-bar'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { WhyChooseUs } from '@/components/home/why-choose-us'
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

      <StatsBar />

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
