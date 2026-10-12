import { createClient } from '@/lib/supabase/server'

/**
 * The exam attached to a lesson, as a student sees it.
 *
 * Nothing here can reach the answer key: the questions come from
 * `quiz_questions_public` and `quiz_options_public`, views that do not
 * carry `is_correct`, and the column has no SELECT privilege for any
 * client role anyway. Grading happens in `submit_quiz_attempt`.
 *
 * RLS decides visibility — the quiz is readable only by someone who can
 * reach its lesson — so a locked lesson simply returns null here rather
 * than needing an access check of its own.
 */

export type QuizOption = { id: string; body_ar: string }

export type QuizQuestion = {
  id: string
  body_ar: string
  options: QuizOption[]
}

export type LessonQuiz = {
  id: string
  title_ar: string
  description_ar: string | null
  pass_percent: number
  questions: QuizQuestion[]
  /** The student's most recent attempt, if they have taken it. */
  lastAttempt: QuizAttempt | null
  /** Their highest score — what the lesson is judged on. */
  bestAttempt: QuizAttempt | null
  attemptCount: number
}

export type QuizAttempt = {
  scorePercent: number
  passed: boolean
  createdAt: string
}

export async function getLessonQuiz(lessonId: string): Promise<LessonQuiz | null> {
  const supabase = await createClient()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title_ar, description_ar, pass_percent')
    .eq('lesson_id', lessonId)
    .eq('is_active', true)
    .maybeSingle()

  if (!quiz) return null

  const { data: questions } = await supabase
    .from('quiz_questions_public')
    .select('id, body_ar, sort_order')
    .eq('quiz_id', quiz.id)
    .order('sort_order')

  const questionIds = (questions ?? []).map((q) => q.id).filter((id): id is string => Boolean(id))

  // An exam with no questions is not an exam. It can exist for a moment
  // while it is being written, and it should stay invisible until it is.
  if (questionIds.length === 0) return null

  const { data: options } = await supabase
    .from('quiz_options_public')
    .select('id, question_id, body_ar, sort_order')
    .in('question_id', questionIds)
    .order('sort_order')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The attempts policy already restricts this to the caller's own rows,
  // but it also admits admins — without the filter an admin would see
  // somebody else's score as their own.
  const { data: attempts } = user
    ? await supabase
        .from('quiz_attempts')
        .select('score_percent, passed, created_at')
        .eq('quiz_id', quiz.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: null }

  const history: QuizAttempt[] = (attempts ?? []).map((a) => ({
    scorePercent: a.score_percent,
    passed: a.passed,
    createdAt: a.created_at,
  }))

  return {
    id: quiz.id,
    title_ar: quiz.title_ar,
    description_ar: quiz.description_ar,
    pass_percent: quiz.pass_percent,
    questions: (questions ?? [])
      .filter((q) => q.id)
      .map((q) => ({
        id: q.id!,
        body_ar: q.body_ar ?? '',
        options: (options ?? [])
          .filter((o) => o.question_id === q.id && o.id)
          .map((o) => ({ id: o.id!, body_ar: o.body_ar ?? '' })),
      }))
      // A question whose options failed to load would be unanswerable and
      // would drag the score down for a reason the student cannot see.
      .filter((q) => q.options.length > 0),
    lastAttempt: history[0] ?? null,
    bestAttempt:
      history.length > 0
        ? history.reduce((best, a) => (a.scorePercent > best.scorePercent ? a : best))
        : null,
    attemptCount: history.length,
  }
}
