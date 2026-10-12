import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { QuizEditor, type EditableQuiz } from '@/components/admin/quiz-editor'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'تعديل الامتحان', robots: { index: false } }

type Params = Promise<{ lessonId: string }>

/**
 * The exam editor for one lesson.
 *
 * The existing exam comes from `get_quiz_for_admin` rather than from the
 * tables: it is the only way to see `is_correct`, which no client role may
 * SELECT. The function checks `is_admin()` itself, so a stray link cannot
 * leak the answers even if middleware were wrong about this route.
 */
export default async function AdminQuizPage({ params }: { params: Params }) {
  const { lessonId } = await params
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title_ar, course:courses(slug, title_ar)')
    .eq('id', lessonId)
    .maybeSingle()

  if (!lesson) notFound()

  const { data, error } = await supabase.rpc('get_quiz_for_admin', { p_lesson_id: lessonId })

  if (error) {
    console.error('[AdminQuizPage]', error)
  }

  const existing = (data ?? null) as EditableQuiz | null
  const course = Array.isArray(lesson.course) ? lesson.course[0] : lesson.course

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/admin/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        كل الامتحانات
      </Link>

      <h1 className="display mt-6 text-3xl text-navy-900">{lesson.title_ar}</h1>
      <p className="mt-2 text-sm text-muted">{course?.title_ar}</p>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          تعذّر تحميل الامتحان الحالي. لو حفظت دلوقتي هيتكتب امتحان جديد مكانه.
        </p>
      )}

      <div className="mt-8">
        <QuizEditor lessonId={lesson.id} initial={existing} />
      </div>
    </div>
  )
}
