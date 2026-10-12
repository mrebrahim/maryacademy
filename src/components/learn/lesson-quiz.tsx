'use client'

import { Award, CircleHelp, RotateCcw } from 'lucide-react'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { submitQuiz, type SubmitState } from '@/app/actions/quizzes'
import { Button } from '@/components/ui/button'
import type { LessonQuiz } from '@/lib/quizzes'
import { cn } from '@/lib/utils'

/**
 * The exam under a lesson.
 *
 * The result is a score and a verdict, not a correction: saying which
 * answers were wrong would hand over the key one attempt at a time, and
 * the exam can be retaken as often as the student likes. If the academy
 * ever wants a review screen, it belongs behind "no more attempts", not
 * here.
 */

function SubmitButton({ answered, total }: { answered: number; total: number }) {
  const { pending } = useFormStatus()
  const complete = answered === total

  return (
    <Button type="submit" size="md" disabled={pending || !complete}>
      {pending ? 'بنصحّح…' : complete ? 'سلّم الامتحان' : `باقي ${total - answered} سؤال`}
    </Button>
  )
}

export function LessonQuiz({ quiz, courseSlug }: { quiz: LessonQuiz; courseSlug: string }) {
  const [state, action] = useActionState<SubmitState, FormData>(submitQuiz, null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  // After a result, the form is replaced by the verdict until the student
  // asks to try again — resubmitting the same ticked boxes by reflex is
  // not a second attempt at anything.
  const [retaking, setRetaking] = useState(false)

  const result = state?.ok ? state.result : undefined
  const showResult = Boolean(result) && !retaking

  const answered = Object.keys(answers).length

  if (showResult && result) {
    return (
      <section className="mt-8 rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:p-7">
        <div
          className={cn(
            'flex flex-wrap items-center gap-3',
            result.passed ? 'text-gold-600' : 'text-navy-900',
          )}
        >
          {result.passed && <Award className="size-6" aria-hidden="true" />}
          <h2 className="display text-xl">
            {result.passed ? 'مبروك، نجحت في الامتحان' : 'محتاج تحاول تاني'}
          </h2>
        </div>

        <p className="tabular mt-4 font-display text-4xl text-navy-900">{result.scorePercent}%</p>
        <p className="mt-1 text-sm text-muted">
          جاوبت صح على {result.correct} من {result.total} · النجاح من {result.passPercent}%
        </p>

        <div className="mt-6">
          <Button
            type="button"
            variant="tertiary"
            size="md"
            onClick={() => {
              setAnswers({})
              setRetaking(true)
            }}
          >
            <RotateCcw aria-hidden="true" />
            {result.passed ? 'ادخل الامتحان تاني' : 'حاول تاني'}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-8 rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:p-7">
      <div className="flex items-start gap-3">
        <CircleHelp className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
        <div>
          <h2 className="display text-xl text-navy-900">{quiz.title_ar}</h2>
          {quiz.description_ar && (
            <p className="mt-2 text-sm leading-loose text-muted">{quiz.description_ar}</p>
          )}
          <p className="tabular mt-2 text-xs text-muted">
            {quiz.questions.length} أسئلة · النجاح من {quiz.pass_percent}%
          </p>
        </div>
      </div>

      {quiz.bestAttempt && !retaking && (
        <p className="tabular mt-5 rounded-lg bg-cream-50 px-4 py-3 text-sm text-navy-900">
          أعلى نتيجة ليك: {quiz.bestAttempt.scorePercent}%
          {quiz.bestAttempt.passed ? ' — ناجح' : ''}
          {quiz.attemptCount > 1 && ` · دخلت الامتحان ${quiz.attemptCount} مرات`}
        </p>
      )}

      <form action={action} className="mt-6">
        <input type="hidden" name="quizId" value={quiz.id} />
        <input type="hidden" name="courseSlug" value={courseSlug} />

        <ol className="space-y-7">
          {quiz.questions.map((question, index) => (
            <li key={question.id}>
              <fieldset>
                <legend className="text-base font-semibold text-navy-900">
                  <span className="tabular text-muted">{index + 1}.</span> {question.body_ar}
                </legend>

                <div className="mt-3 space-y-2">
                  {question.options.map((option) => {
                    const checked = answers[question.id] === option.id
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition',
                          checked
                            ? 'border-gold-500 bg-gold-500/5 text-navy-900'
                            : 'border-navy-900/15 text-ink hover:border-gold-500/50',
                        )}
                      >
                        <input
                          type="radio"
                          name={`q:${question.id}`}
                          value={option.id}
                          checked={checked}
                          onChange={() =>
                            setAnswers((a) => ({ ...a, [question.id]: option.id }))
                          }
                          className="size-4 accent-gold-500"
                        />
                        {option.body_ar}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <SubmitButton answered={answered} total={quiz.questions.length} />
          {state && !state.ok && (
            <p role="status" className="text-sm text-red-600">
              {state.messageAr}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}
