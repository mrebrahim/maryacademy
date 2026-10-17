import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CurriculumEditor } from '@/components/admin/curriculum-editor'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'دروس الدورة', robots: { index: false } }

type Params = Promise<{ courseId: string }>

/**
 * The curriculum of one course: its parts and the lessons inside them.
 *
 * Read through `lessons_public` rather than `lessons`, like everything
 * else in the app — the video id is not editable here anyway. It is
 * written by the Bunny sync, which reads the real library; a hand-typed
 * GUID is how a lesson ends up silently playing the wrong video.
 */
export default async function CurriculumPage({ params }: { params: Params }) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title_ar, slug, status')
    .eq('id', courseId)
    .maybeSingle()

  if (!course) notFound()

  const [{ data: modules }, { data: lessons }, { data: flags }] = await Promise.all([
    supabase
      .from('modules')
      .select('id, title_ar, sort_order')
      .eq('course_id', courseId)
      .order('sort_order'),
    supabase
      .from('lessons_public')
      .select('id, module_id, title_ar, slug, sort_order, duration_seconds, is_free_preview')
      .eq('course_id', courseId)
      .order('sort_order'),
    // The video flag cannot come from the view: `lessons_public` is
    // security_invoker, so any column it touches has to be readable by
    // the caller, and `bunny_video_id` is readable by nobody.
    supabase.rpc('get_lesson_video_flags', { p_course_id: courseId }),
  ])

  const videoFlags = (flags ?? {}) as Record<string, boolean>

  return (
    <div>
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        المحتوى
      </Link>

      <h1 className="display mt-6 text-2xl text-navy-900 sm:text-3xl">{course.title_ar}</h1>
      <p className="mt-2 text-sm text-muted">
        {course.status === 'published' ? 'منشورة' : 'مسودة'} · {(lessons ?? []).length} درس
      </p>

      <div className="mt-8">
        <CurriculumEditor
          courseId={course.id}
          modules={(modules ?? []).map((m) => ({
            id: m.id,
            title_ar: m.title_ar,
            lessons: (lessons ?? [])
              .filter((l) => l.module_id === m.id)
              .map((l) => ({
                id: l.id!,
                title_ar: l.title_ar ?? '',
                slug: l.slug ?? '',
                sort_order: l.sort_order ?? 0,
                duration_seconds: l.duration_seconds ?? 0,
                is_free_preview: Boolean(l.is_free_preview),
                has_video: Boolean(videoFlags[l.id ?? '']),
              })),
          }))}
        />
      </div>
    </div>
  )
}
