import { ArrowLeft, Award, BookOpen } from 'lucide-react'
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Filtered by user_id explicitly. The enrolments policy reads
  // `user_id = auth.uid() OR is_admin()`, which is right for the admin
  // panel and wrong here: without this line an admin's "my courses" page
  // lists every enrolment on the platform as if it were their own.
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(
      'id, status, progress_percent, certificate_serial, course:courses(title_ar, slug, lesson_count)',
    )
    .eq('user_id', user?.id ?? '')
    .eq('status', 'active')

  // An admin owns the courses rather than buying them, so this page would
  // otherwise tell the academy it has not subscribed to anything. They get
  // the published catalogue instead, clearly labelled as a staff view.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const isAdmin = profile?.role === 'admin'

  const { data: adminCourses } = isAdmin
    ? await supabase
        .from('courses')
        .select('title_ar, slug, lesson_count')
        .eq('status', 'published')
        .order('title_ar')
    : { data: null }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">دوراتي</h1>

      {isAdmin && (adminCourses?.length ?? 0) > 0 && (
        <section className="mt-8">
          <p className="text-sm text-muted">
            دي كل الدورات المنشورة — مفتوحة لك كأدمن للمراجعة، من غير ما يتسجّل
            تقدّم أو شهادة.
          </p>
          <ul className="mt-4 space-y-3">
            {(adminCourses ?? []).map((course) => (
              <li
                key={course.slug}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5"
              >
                <div>
                  <h2 className="text-base text-navy-900">{course.title_ar}</h2>
                  <p className="tabular mt-1 text-xs text-muted">{course.lesson_count} درس</p>
                </div>
                <Button asChild variant="tertiary" size="sm">
                  <Link href={`/watch/${course.slug}`}>
                    راجع الدورة
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isAdmin && (!enrollments || enrollments.length === 0) ? null : !enrollments ||
        enrollments.length === 0 ? (
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
                  <div className="flex flex-wrap items-center gap-2">
                    {enrollment.certificate_serial && course?.slug && (
                      <Button asChild variant="tertiary" size="sm">
                        <Link href={`/certificate/${course.slug}`}>
                          <Award className="size-4" aria-hidden="true" />
                          الشهادة
                        </Link>
                      </Button>
                    )}
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
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
