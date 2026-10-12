'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Exams.
 *
 * Two audiences, one file, and the split matters: `submitQuiz` runs for a
 * student and may not learn anything about the answer key, while
 * `saveQuiz` and `removeQuiz` run for the academy and are allowed to see
 * it. Neither trusts this file for that — `is_admin()` is re-checked
 * inside the database — but keeping the two paths visibly apart makes it
 * obvious when a change crosses the line.
 *
 * The score is never sent from the browser. The browser sends which
 * option was picked per question; `submit_quiz_attempt` grades it.
 */

export type QuizResult = {
  scorePercent: number
  correct: number
  total: number
  passed: boolean
  passPercent: number
}

export type SubmitState = { ok: boolean; messageAr: string; result?: QuizResult } | null

const submitSchema = z.object({
  quizId: z.uuid(),
  courseSlug: z.string().min(1),
  // question id -> option id
  answers: z.record(z.uuid(), z.uuid()),
})

export async function submitQuiz(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  // The form carries one field per question, named `q:<question id>`.
  const answers: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('q:') && typeof value === 'string' && value) {
      answers[key.slice(2)] = value
    }
  }

  const parsed = submitSchema.safeParse({
    quizId: formData.get('quizId'),
    courseSlug: formData.get('courseSlug'),
    answers,
  })

  if (!parsed.success) return { ok: false, messageAr: 'راجع إجاباتك وحاول تاني.' }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_quiz_id: parsed.data.quizId,
      p_answers: parsed.data.answers,
    })

    if (error) {
      if (error.message.includes('not_authenticated')) {
        return { ok: false, messageAr: 'سجّل دخولك الأول عشان تدخل الامتحان.' }
      }
      if (error.message.includes('no_access')) {
        return { ok: false, messageAr: 'الامتحان ده للمشتركين في الدورة.' }
      }
      if (error.message.includes('quiz_not_found')) {
        return { ok: false, messageAr: 'الامتحان ده مش متاح دلوقتي.' }
      }
      throw error
    }

    const result = data as {
      score_percent: number
      correct: number
      total: number
      passed: boolean
      pass_percent: number
    } | null

    if (!result) throw new Error('empty result')

    revalidatePath(`/watch/${parsed.data.courseSlug}`, 'layout')

    return {
      ok: true,
      messageAr: result.passed ? 'مبروك، نجحت' : 'للأسف مجبتش النسبة المطلوبة',
      result: {
        scorePercent: result.score_percent,
        correct: result.correct,
        total: result.total,
        passed: result.passed,
        passPercent: result.pass_percent,
      },
    }
  } catch (error) {
    console.error('[submitQuiz]', error)
    return { ok: false, messageAr: 'تعذّر تسليم الامتحان، حاول تاني.' }
  }
}

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------

export type QuizEditorState = { ok: boolean; messageAr: string } | null

const optionSchema = z.object({
  body_ar: z.string().trim().min(1),
  is_correct: z.boolean(),
})

const questionSchema = z.object({
  body_ar: z.string().trim().min(3).max(1000),
  options: z.array(optionSchema).min(2).max(6),
})

const quizSchema = z.object({
  lessonId: z.uuid(),
  title_ar: z.string().trim().min(1),
  description_ar: z.string().trim().nullable(),
  pass_percent: z.coerce.number().int().min(1).max(100),
  is_active: z.boolean(),
  questions: z.array(questionSchema).min(1),
})

/**
 * Arabic for the errors `set_lesson_quiz` raises. A question number is
 * appended to several of them, which is the difference between "something
 * is wrong" and knowing where to look.
 */
function messageForDbError(message: string): string | null {
  const at = (n: string) => `السؤال رقم ${n}`

  const needsCorrect = message.match(/needs_one_correct_answer:(\d+)/)
  if (needsCorrect) return `${at(needsCorrect[1])}: لازم تحدد إجابة صحيحة واحدة بالظبط.`

  const optionCount = message.match(/option_count:(\d+)/)
  if (optionCount) return `${at(optionCount[1])}: لازم يكون فيه من اختيارين لـ 6 اختيارات.`

  const shortBody = message.match(/question_body_too_short:(\d+)/)
  if (shortBody) return `${at(shortBody[1])}: نص السؤال قصير أوي.`

  const emptyOption = message.match(/option_body_empty:(\d+)/)
  if (emptyOption) return `${at(emptyOption[1])}: فيه اختيار فاضي.`

  if (message.includes('not_authorised')) return 'الصلاحية دي للإدارة فقط.'
  if (message.includes('no_questions')) return 'الامتحان لازم يكون فيه سؤال واحد على الأقل.'
  if (message.includes('title_required')) return 'اكتب عنوان للامتحان.'
  if (message.includes('pass_percent_out_of_range')) return 'نسبة النجاح لازم تكون بين 1 و 100.'
  if (message.includes('lesson_not_found')) return 'الدرس ده مش موجود.'

  return null
}

export async function saveQuiz(
  _prev: QuizEditorState,
  formData: FormData,
): Promise<QuizEditorState> {
  // The editor keeps the whole exam in React state and posts it as one
  // JSON field. Flat form fields would mean reconstructing the nesting
  // here from names like `q.0.options.2.body`, and getting that wrong is
  // how an option ends up attached to the wrong question.
  let payload: unknown
  try {
    payload = JSON.parse(String(formData.get('quiz') ?? ''))
  } catch {
    return { ok: false, messageAr: 'راجع بيانات الامتحان.' }
  }

  const parsed = quizSchema.safeParse({ lessonId: formData.get('lessonId'), ...(payload as object) })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    // Zod's path is `questions.<n>.…`; the number the academy sees is
    // one-based, like the editor's own numbering.
    const index = typeof issue?.path[1] === 'number' ? issue.path[1] + 1 : null
    return {
      ok: false,
      messageAr: index
        ? `السؤال رقم ${index}: راجع نص السؤال والاختيارات.`
        : 'راجع بيانات الامتحان.',
    }
  }

  const { lessonId, ...quiz } = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('set_lesson_quiz', {
      p_lesson_id: lessonId,
      p_quiz: quiz,
    })

    if (error) {
      const friendly = messageForDbError(error.message)
      if (friendly) return { ok: false, messageAr: friendly }
      throw error
    }
  } catch (error) {
    console.error('[saveQuiz]', error)
    return { ok: false, messageAr: 'تعذّر الحفظ، حاول تاني.' }
  }

  revalidatePath('/admin/quizzes')
  revalidatePath(`/admin/quizzes/${lessonId}`)
  revalidatePath('/watch', 'layout')
  return { ok: true, messageAr: 'الامتحان اتحفظ' }
}

export async function removeQuiz(
  _prev: QuizEditorState,
  formData: FormData,
): Promise<QuizEditorState> {
  const lessonId = z.uuid().safeParse(formData.get('lessonId'))
  if (!lessonId.success) return { ok: false, messageAr: 'راجع البيانات.' }

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('delete_lesson_quiz', { p_lesson_id: lessonId.data })

    if (error) {
      const friendly = messageForDbError(error.message)
      if (friendly) return { ok: false, messageAr: friendly }
      throw error
    }
  } catch (error) {
    console.error('[removeQuiz]', error)
    return { ok: false, messageAr: 'تعذّر المسح، حاول تاني.' }
  }

  revalidatePath('/admin/quizzes')
  revalidatePath(`/admin/quizzes/${lessonId.data}`)
  revalidatePath('/watch', 'layout')
  return { ok: true, messageAr: 'الامتحان اتمسح' }
}
