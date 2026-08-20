import { ArrowLeft, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'دوراتي',
  robots: { index: false },
}

/**
 * My-courses dashboard. The player and progress tracking land next; this
 * already reads real enrolments so it is correct the moment one exists,
 * rather than being a mock to replace later.
 */
export default async function LearnPage() {
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, status, progress_percent, course:courses(title_ar, slug, lesson_count)')
    .eq('status', 'active')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">دوراتي</h1>

      {!enrollments || enrollments.length === 0 ? (
        <div className="mt-10 rounded-card bg-white p-10 text-center shadow-soft ring-1 ring-navy-900/5">
          <BookOpen className="mx-auto size-10 text-gold-500" aria-hidden="true" />
          <p className="mt-5 text-lg text-navy-900">لسه مشتركش في أي دورة</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-loose text-muted">
            أول ما تحجز دورة هتلاقيها هنا، وتقدر تكمّل من أي جهاز من النقطة اللي وقفت عندها.
          </p>
          <Button asChild size="md" className="mt-7">
            <Link href="/courses">تصفّح الدورات</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {enrollments.map((enrollment) => {
            const course = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course
            return (
              <li
                key={enrollment.id}
                className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5"
              >
                <h2 className="text-lg text-navy-900">{course?.title_ar}</h2>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-navy-900/10">
                  <div
                    className="h-full rounded-full bg-gold-500"
                    style={{ width: `${enrollment.progress_percent}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                  <p className="tabular text-xs text-muted">
                    {enrollment.progress_percent}% مكتمل
                  </p>
                  {course?.slug && (
                    <Button asChild size="sm">
                      {/* /watch/[slug] resolves to the first unfinished lesson. */}
                      <Link href={`/watch/${course.slug}`}>
                        {enrollment.progress_percent > 0 ? 'أكمل الدورة' : 'ابدأ الدورة'}
                        <ArrowLeft className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
