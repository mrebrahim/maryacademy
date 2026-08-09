import { Droplet, Palette, Scissors, Sparkles, Wand2 } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Category, Course } from '@/lib/queries'
import { formatDuration } from '@/lib/utils'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  scissors: Scissors,
  palette: Palette,
  sparkles: Sparkles,
  droplet: Droplet,
  wand: Wand2,
}

/** Latin name shown above the Arabic one, matching the mockup's card style. */
const LATIN_NAME: Record<string, string> = {
  'hair-styling': 'Hair Styling',
  'hair-color': 'Hair Color',
  'hair-cutting': 'Hair Cutting',
  makeup: 'Makeup',
  'skin-care': 'Skin Care',
}

function CardShell({
  icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const Icon = icon
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-navy-900/5">
      {/* Thumbnail slot. Real 16:9 photography replaces this gradient once
          the client supplies the shots. */}
      <div className="relative aspect-video bg-gradient-to-bl from-navy-800 to-navy-900">
        <span className="absolute -bottom-6 start-1/2 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-gold-500 text-navy-900 rtl:translate-x-1/2">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center px-4 pt-10 pb-5 text-center">{children}</div>
    </div>
  )
}

export function CoursesGrid({
  courses,
  categories,
}: {
  courses: Course[]
  categories: Category[]
}) {
  // A category that already has a published course links to that course.
  // Everything else is roadmap and gets a "قريبًا" card pointing at the
  // waitlist rather than a dead page (PRD §7.1.3).
  const published = new Map(courses.map((c) => [c.slug, c]))
  const liveCourse = courses[0]

  return (
    <section aria-labelledby="courses-heading" className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading title="دوراتنا" />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = ICONS[category.icon ?? 'sparkles'] ?? Sparkles
            const isLive = category.slug === 'hair-styling' && liveCourse

            return (
              <li key={category.id}>
                <CardShell icon={Icon}>
                  <p className="font-display text-base text-navy-900">
                    {LATIN_NAME[category.slug] ?? category.name_ar}
                  </p>
                  <p className="mt-1 text-sm text-muted">{category.name_ar}</p>

                  {isLive ? (
                    <>
                      <p className="mt-2 text-xs text-muted">
                        <span className="tabular">{liveCourse.lesson_count}</span> درس ·{' '}
                        {formatDuration(liveCourse.total_duration_minutes * 60)}
                      </p>
                      <Button asChild variant="tertiary" size="sm" className="mt-4 w-full">
                        <Link href={`/courses/${liveCourse.slug}`}>اعرفي المزيد</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 inline-flex rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-500">
                        قريبًا
                      </p>
                      <Button asChild variant="ghost" size="sm" className="mt-4 w-full border border-navy-900/15">
                        <Link href={`/courses/interest?category=${category.slug}`}>
                          سجلي اهتمامك
                        </Link>
                      </Button>
                    </>
                  )}
                </CardShell>
              </li>
            )
          })}

          {/* Any published course outside the five roadmap categories. */}
          {courses
            .filter((course) => !published.has(course.slug) && course.slug !== liveCourse?.slug)
            .map((course) => (
              <li key={course.id}>
                <CardShell icon={Sparkles}>
                  <p className="font-display text-base text-navy-900">{course.title_ar}</p>
                  <Button asChild variant="tertiary" size="sm" className="mt-4 w-full">
                    <Link href={`/courses/${course.slug}`}>اعرفي المزيد</Link>
                  </Button>
                </CardShell>
              </li>
            ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="secondary" size="md" className="border-navy-900/25 text-navy-900 hover:bg-navy-900 hover:text-white">
            <Link href="/courses">عرض جميع الدورات</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
