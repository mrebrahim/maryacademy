'use client'

import { Plus, Trash2, X } from 'lucide-react'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { removeQuiz, saveQuiz, type QuizEditorState } from '@/app/actions/quizzes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-gold-500'

export type EditableOption = { body_ar: string; is_correct: boolean }
export type EditableQuestion = { body_ar: string; options: EditableOption[] }
export type EditableQuiz = {
  title_ar: string
  description_ar: string | null
  pass_percent: number
  is_active: boolean
  questions: EditableQuestion[]
}

const blankQuestion = (): EditableQuestion => ({
  body_ar: '',
  options: [
    { body_ar: '', is_correct: true },
    { body_ar: '', is_correct: false },
  ],
})

const blankQuiz = (): EditableQuiz => ({
  title_ar: 'امتحان الدرس',
  description_ar: null,
  pass_percent: 60,
  is_active: true,
  questions: [blankQuestion()],
})

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? 'بنحفظ…' : 'احفظ الامتحان'}
    </Button>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden="true" />
      {pending ? 'لحظة…' : 'امسح الامتحان'}
    </button>
  )
}

/**
 * The whole exam lives in React state and is posted as one JSON field.
 *
 * It is written as a replacement, not a patch — the database deletes the
 * old questions and writes the new ones in one transaction — which is why
 * reordering or deleting a question here needs no ids and cannot leave a
 * half-written exam live for students.
 *
 * Exactly one option per question is correct, so the correct answer is a
 * radio group: the shape of the control is the rule, and the academy
 * cannot accidentally tick two.
 */
export function QuizEditor({ lessonId, initial }: { lessonId: string; initial: EditableQuiz | null }) {
  const [state, action] = useActionState<QuizEditorState, FormData>(saveQuiz, null)
  const [deleteState, deleteAction] = useActionState<QuizEditorState, FormData>(removeQuiz, null)
  const [quiz, setQuiz] = useState<EditableQuiz>(initial ?? blankQuiz())
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function patch(changes: Partial<EditableQuiz>) {
    setQuiz((q) => ({ ...q, ...changes }))
  }

  function patchQuestion(index: number, changes: Partial<EditableQuestion>) {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((question, i) =>
        i === index ? { ...question, ...changes } : question,
      ),
    }))
  }

  function patchOption(qIndex: number, oIndex: number, body: string) {
    patchQuestion(qIndex, {
      options: quiz.questions[qIndex].options.map((o, i) =>
        i === oIndex ? { ...o, body_ar: body } : o,
      ),
    })
  }

  function markCorrect(qIndex: number, oIndex: number) {
    patchQuestion(qIndex, {
      options: quiz.questions[qIndex].options.map((o, i) => ({ ...o, is_correct: i === oIndex })),
    })
  }

  function removeOption(qIndex: number, oIndex: number) {
    const options = quiz.questions[qIndex].options.filter((_, i) => i !== oIndex)
    // Deleting the correct one would leave a question nobody can pass, so
    // the first remaining option inherits it rather than the save failing
    // later with a message about a question the academy has moved on from.
    if (!options.some((o) => o.is_correct) && options.length > 0) options[0].is_correct = true
    patchQuestion(qIndex, { options })
  }

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="quiz" value={JSON.stringify(quiz)} />

        {/* ---- The exam itself ---- */}
        <div className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">عنوان الامتحان</span>
            <input
              value={quiz.title_ar}
              onChange={(e) => patch({ title_ar: e.target.value })}
              className={cn(field, 'mt-2')}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-navy-900">
              تعليمات للطالبة <span className="font-normal text-muted">(اختياري)</span>
            </span>
            <textarea
              value={quiz.description_ar ?? ''}
              onChange={(e) => patch({ description_ar: e.target.value || null })}
              rows={2}
              className={cn(field, 'mt-2 resize-y')}
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <span className="text-sm font-semibold text-navy-900">نسبة النجاح</span>
              <input
                type="number"
                min={1}
                max={100}
                value={quiz.pass_percent}
                onChange={(e) => patch({ pass_percent: Number(e.target.value) })}
                className={cn(field, 'tabular w-20')}
              />
              <span className="text-sm text-muted">%</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-navy-900">
              <input
                type="checkbox"
                checked={quiz.is_active}
                onChange={(e) => patch({ is_active: e.target.checked })}
                className="size-4 accent-gold-500"
              />
              ظاهر للطالبات
            </label>
          </div>
        </div>

        {/* ---- Questions ---- */}
        <ol className="space-y-5">
          {quiz.questions.map((question, qIndex) => (
            <li
              key={qIndex}
              className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="tabular mt-2.5 text-sm font-semibold text-muted">
                  {qIndex + 1}.
                </span>
                <textarea
                  value={question.body_ar}
                  onChange={(e) => patchQuestion(qIndex, { body_ar: e.target.value })}
                  rows={2}
                  placeholder="نص السؤال"
                  className={cn(field, 'resize-y')}
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuiz((q) => ({
                      ...q,
                      questions:
                        q.questions.length === 1
                          ? [blankQuestion()]
                          : q.questions.filter((_, i) => i !== qIndex),
                    }))
                  }
                  className="mt-1.5 grid size-8 shrink-0 place-items-center rounded-lg border border-navy-900/15 text-muted transition hover:border-red-300 hover:text-red-600"
                  aria-label={`شيل السؤال رقم ${qIndex + 1}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-4 text-xs text-muted">حدّد الإجابة الصحيحة</p>

              <div className="mt-2 space-y-2">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={option.is_correct}
                      onChange={() => markCorrect(qIndex, oIndex)}
                      className="size-4 shrink-0 accent-gold-500"
                      aria-label={`الإجابة رقم ${oIndex + 1} صح`}
                    />
                    <input
                      value={option.body_ar}
                      onChange={(e) => patchOption(qIndex, oIndex, e.target.value)}
                      placeholder={`اختيار ${oIndex + 1}`}
                      className={cn(field, 'flex-1')}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      disabled={question.options.length <= 2}
                      className="grid size-8 shrink-0 place-items-center rounded-lg border border-navy-900/15 text-muted transition hover:border-red-300 hover:text-red-600 disabled:opacity-40 disabled:hover:border-navy-900/15 disabled:hover:text-muted"
                      aria-label={`شيل الاختيار رقم ${oIndex + 1}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              {question.options.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    patchQuestion(qIndex, {
                      options: [...question.options, { body_ar: '', is_correct: false }],
                    })
                  }
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  اختيار تاني
                </button>
              )}
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => setQuiz((q) => ({ ...q, questions: [...q.questions, blankQuestion()] }))}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition hover:text-gold-600"
        >
          <Plus className="size-4" aria-hidden="true" />
          سؤال جديد
        </button>

        <div className="flex flex-wrap items-center gap-4 border-t border-navy-900/10 pt-6">
          <SaveButton />
          {state && (
            <p
              role="status"
              className={cn('text-sm', state.ok ? 'text-gold-600' : 'text-red-600')}
            >
              {state.messageAr}
            </p>
          )}
        </div>
      </form>

      {/* ---- Deleting, in its own form so it cannot be submitted by Enter
              from a text field in the editor above ---- */}
      {initial && (
        <div className="border-t border-navy-900/10 pt-6">
          {confirmingDelete ? (
            <form action={deleteAction} className="flex flex-wrap items-center gap-4">
              <input type="hidden" name="lessonId" value={lessonId} />
              <p className="text-sm text-navy-900">
                هيتمسح الامتحان ونتايج الطالبات فيه. أكيد؟
              </p>
              <DeleteButton />
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-sm text-muted underline underline-offset-4"
              >
                إلغاء
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-red-600"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              امسح الامتحان
            </button>
          )}

          {deleteState && (
            <p
              role="status"
              className={cn('mt-3 text-sm', deleteState.ok ? 'text-gold-600' : 'text-red-600')}
            >
              {deleteState.messageAr}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
