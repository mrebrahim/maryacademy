import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'امتحانات الدروس', robots: { index: false } }

/**
 * One exam per lesson, so the list of lessons is the list of exams —
 * there is nothing to create, only a lesson that does not have one yet.
 *
 * Counting questions here rather than in the editor keeps the common
 * question ("which lessons still need an exam?") answerable at a glance.
 */
export default async function AdminQuizzesPage() {
  const supabase = await createClient()

  const [{ data: lessons }, { data: quizzes }, { data: attempts }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title_ar, sort_order, module:modules(title_ar, sort_order)')
      .order('sort_order'),
    supabase.from('quizzes').select('id, lesson_id, is_active, pass_percent'),
    supabase.from('quiz_attempts').select('quiz_id, passed'),
  ])

  const { data: questions } = await supabase.from('quiz_questions').select('quiz_id')

  const byLesson = new Map((quizzes ?? []).map((q) => [q.lesson_id, q]))

  const questionCount = new Map<string, number>()
  for (const q of questions ?? []) {
    questionCount.set(q.quiz_id, (questionCount.get(q.quiz_id) ?? 0) + 1)
  }

  const attemptStats = new Map<string, { total: number; passed: number }>()
  for (const a of attempts ?? []) {
    const stat = attemptStats.get(a.quiz_id) ?? { total: 0, passed: 0 }
    stat.total += 1
    if (a.passed) stat.passed += 1
    attemptStats.set(a.quiz_id, stat)
  }

  const rows = lessons ?? []
  const withExam = rows.filter((l) => byLesson.has(l.id)).length

  return (
    <div>
      <h1 className="display text-3xl text-navy-900">امتحانات الدروس</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        امتحان قصير بعد كل درس، أسئلة اختيار من متعدد. الطالبة بتشوف نتيجتها بس — الإجابات
        الصح مش بتوصل المتصفح أصلاً، التصحيح بيحصل عندنا.
      </p>
      <p className="tabular mt-2 text-sm text-muted">
        {withExam} من {rows.length} درس عليهم امتحان
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          مفيش دروس لسه.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {rows.map((lesson) => {
            const quiz = byLesson.get(lesson.id)
            const count = quiz ? (questionCount.get(quiz.id) ?? 0) : 0
            const stats = quiz ? attemptStats.get(quiz.id) : undefined
            const section = Array.isArray(lesson.module) ? lesson.module[0] : lesson.module

            return (
              <li key={lesson.id}>
                <Link
                  href={`/admin/quizzes/${lesson.id}`}
                  className="flex items-center justify-between gap-4 rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 transition hover:ring-gold-500/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base text-navy-900">{lesson.title_ar}</p>
                    <p className="tabular mt-1 text-xs text-muted">
                      {section?.title_ar}
                      {quiz ? (
                        <>
                          {' · '}
                          {count} سؤال · النجاح من {quiz.pass_percent}%
                          {!quiz.is_active && ' · موقوف'}
                          {stats && ` · ${stats.passed} نجحوا من ${stats.total} محاولة`}
                        </>
                      ) : (
                        ' · مفيش امتحان'
                      )}
                    </p>
                  </div>
                  <ArrowLeft className="size-4 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
