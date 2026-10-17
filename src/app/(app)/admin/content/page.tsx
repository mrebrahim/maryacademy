import { ArrowLeft, ImageOff, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { CourseEditor } from '@/components/admin/course-editor'
import { LessonRow } from '@/components/admin/lesson-row'
import { ThumbnailUpload } from '@/components/admin/thumbnail-upload'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'المحتوى — لوحة التحكم', robots: { index: false } }

/**
 * Course and lesson editing.
 *
 * Everything on this page used to be a SQL statement. A price change, a
 * typo in a title, opening a lesson as a free preview — all of it needed
 * a developer, which is the wrong dependency for a business selling one
 * product.
 *
 * Lesson titles and order are editable here, but the video behind a
 * lesson is not: those come from the Bunny library through
 * `npm run bunny:lessons`, and letting two sources write the same field
 * would mean the next sync silently undoes what was typed here. The row
 * shows whether a video exists so the gap is visible.
 */
export default async function AdminContentPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(
      'id, slug, title_ar, subtitle_ar, description_ar, price_egp, price_egp_intl, compare_at_price_egp, status, certificate_enabled, thumbnail_url',
    )
    .order('created_at')

  // Lessons from the view; the video flag from a function.
  //
  // Not from the table — `lessons.bunny_video_id` has no SELECT privilege
  // for any client role, and naming it made PostgREST refuse the whole
  // query, which showed up as every course having no lessons. And not
  // from the view either: `lessons_public` is security_invoker, so a
  // column it touches must be readable by whoever is asking, even inside
  // a boolean. Putting the flag there took the view down for every reader
  // on the site. A SECURITY DEFINER function is the only place a
  // protected column can be looked at.
  const { data: lessons } = await supabase
    .from('lessons_public')
    .select('id, course_id, title_ar, sort_order, duration_seconds, is_free_preview')
    .order('sort_order')

  const videoFlags = Object.assign(
    {},
    ...(await Promise.all(
      (courses ?? []).map(async (course) => {
        const { data } = await supabase.rpc('get_lesson_video_flags', { p_course_id: course.id })
        return (data ?? {}) as Record<string, boolean>
      }),
    )),
  ) as Record<string, boolean>

  const rows = courses ?? []

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-2xl text-navy-900 sm:text-3xl">المحتوى</h1>
          <p className="mt-3 max-w-xl leading-loose text-muted">
            تعديل الدورات وأسعارها وصورها ودروسها. أي تغيير هنا بيظهر على الموقع على طول.
          </p>
        </div>
        <Button asChild size="md">
          <Link href="/admin/content/new">
            <Plus aria-hidden="true" />
            دورة جديدة
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          مفيش دورات لسه.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {rows.map((course) => {
            const courseLessons = (lessons ?? []).filter((l) => l.course_id === course.id)
            const withoutVideo = courseLessons.filter((l) => !videoFlags[l.id ?? '']).length

            return (
              <section key={course.id}>
                {/* ---- Thumbnail ---- */}
                <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
                  <h2 className="text-lg text-navy-900">صورة الدورة</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    بتظهر على كارت الدورة في الرئيسية وصفحة الدورات. الأفضل 1280×720.
                  </p>

                  <div className="mt-5 flex flex-wrap items-start gap-5">
                    <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-navy-900/5">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt=""
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center">
                          <ImageOff className="size-6 text-muted" aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-3 text-xs text-muted">
                        {course.thumbnail_url
                          ? 'فيه صورة حاليًا'
                          : 'مفيش صورة — الكارت بيظهر بخلفية مزخرفة'}
                      </p>
                      <ThumbnailUpload courseId={course.id} />
                    </div>
                  </div>
                </div>

                {/* ---- Course fields ---- */}
                <div className="mt-5 rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
                  <h2 className="text-lg text-navy-900">بيانات الدورة</h2>
                  <div className="mt-5">
                    <CourseEditor course={course} />
                  </div>
                </div>

                {/* ---- Lessons ---- */}
                <div className="mt-5 rounded-card bg-white shadow-soft ring-1 ring-navy-900/5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5 sm:px-6">
                    <h2 className="text-lg text-navy-900">
                      الدروس{' '}
                      <span className="tabular text-sm text-muted">({courseLessons.length})</span>
                    </h2>
                    {withoutVideo > 0 && (
                      <span className="tabular text-xs text-red-600">
                        {withoutVideo} درس من غير فيديو
                      </span>
                    )}
                  </div>

                  <p className="px-5 pt-2 text-xs leading-relaxed text-muted sm:px-6">
                    الفيديو بيتربط من مكتبة Bunny عن طريق{' '}
                    <code dir="ltr" className="rounded bg-navy-900/5 px-1">
                      npm run bunny:lessons
                    </code>{' '}
                    — مش من هنا، عشان المزامنة الجاية ما تمسحش اللي اتكتب.
                  </p>

                  <div className="mt-3">
                    <Link
                      href={`/admin/content/${course.id}/curriculum`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition hover:text-gold-500"
                    >
                      ضيفي أو شيلي دروس
                      <ArrowLeft className="size-4" aria-hidden="true" />
                    </Link>
                  </div>

                  {courseLessons.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-muted">مفيش دروس لسه.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-navy-900/8">
                      {/* Every column of a view is nullable in the generated
                          types, though the table declares them NOT NULL —
                          narrowed once here rather than in LessonRow. */}
                      {courseLessons.map((lesson) => (
                        <li key={lesson.id}>
                          <LessonRow
                            lesson={{
                              id: lesson.id!,
                              title_ar: lesson.title_ar ?? '',
                              sort_order: lesson.sort_order ?? 0,
                              duration_seconds: lesson.duration_seconds ?? 0,
                              is_free_preview: Boolean(lesson.is_free_preview),
                              has_video: Boolean(videoFlags[lesson.id ?? '']),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
