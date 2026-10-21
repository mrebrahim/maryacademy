'use client'

import { Eye, Plus, Trash2, Video, VideoOff } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  setFreePreview,
  type CurriculumState,
} from '@/app/actions/curriculum'
import { Button } from '@/components/ui/button'
import { cn, formatDuration } from '@/lib/utils'

const field =
  'rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-gold-500'

type Lesson = {
  id: string
  title_ar: string
  slug: string
  sort_order: number
  duration_seconds: number
  is_free_preview: boolean
  has_video: boolean
}

type Module = { id: string; title_ar: string; lessons: Lesson[] }

function Pending({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus()
  return <>{pending ? busy : idle}</>
}

/**
 * The curriculum editor.
 *
 * Each row is its own form posting to its own action, rather than one big
 * form with a save button. On a list of thirteen lessons that difference
 * is the whole usability of the screen: a single form means a mistake in
 * one row blocks every other change, and it means nothing is saved until
 * everything is.
 *
 * The video column is read-only on purpose — it says whether a video is
 * attached and nothing more. Attaching one is the Bunny sync's job.
 */
export function CurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string
  modules: Module[]
}) {
  const [moduleState, moduleAction] = useActionState<CurriculumState, FormData>(createModule, null)
  const [addingTo, setAddingTo] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {modules.length === 0 && (
        <p className="rounded-card bg-white p-6 text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          الدورة لسه فاضية. ابدأ بإضافة جزء — زي «التجهيز» أو «اللوكات» — وبعدها ضيف
          الدروس جواه.
        </p>
      )}

      {modules.map((module) => (
        <section
          key={module.id}
          className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-navy-900">{module.title_ar}</h2>
            <span className="tabular text-xs text-muted">{module.lessons.length} درس</span>
          </div>

          {module.lessons.length > 0 && (
            <ul className="mt-4 divide-y divide-navy-900/10">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="tabular w-6 shrink-0 text-xs text-muted">
                    {lesson.sort_order}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-navy-900">{lesson.title_ar}</span>
                    <span className="tabular mt-0.5 block text-xs text-muted">
                      {formatDuration(lesson.duration_seconds)} ·{' '}
                      <span dir="ltr">{lesson.slug}</span>
                    </span>
                  </span>

                  {lesson.has_video ? (
                    <span
                      className="flex items-center gap-1 text-xs text-gold-600"
                      title="عليه فيديو"
                    >
                      <Video className="size-3.5" aria-hidden="true" />
                      فيديو
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-xs text-muted"
                      title="لسه من غير فيديو"
                    >
                      <VideoOff className="size-3.5" aria-hidden="true" />
                      من غير فيديو
                    </span>
                  )}

                  {lesson.is_free_preview ? (
                    <span className="flex items-center gap-1 rounded-full bg-gold-500/15 px-2.5 py-1 text-xs font-semibold text-gold-700">
                      <Eye className="size-3.5" aria-hidden="true" />
                      معاينة مجانية
                    </span>
                  ) : (
                    <PreviewButton courseId={courseId} lessonId={lesson.id} />
                  )}

                  <DeleteLessonButton courseId={courseId} lessonId={lesson.id} />
                </li>
              ))}
            </ul>
          )}

          {addingTo === module.id ? (
            <NewLessonForm
              courseId={courseId}
              moduleId={module.id}
              onDone={() => setAddingTo(null)}
            />
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setAddingTo(module.id)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition hover:text-gold-600"
              >
                <Plus className="size-4" aria-hidden="true" />
                درس جديد
              </button>

              {module.lessons.length === 0 && (
                <DeleteModuleButton courseId={courseId} moduleId={module.id} />
              )}
            </div>
          )}
        </section>
      ))}

      {/* ---- New module ---- */}
      <form
        action={moduleAction}
        className="flex flex-wrap items-center gap-3 rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5"
      >
        <input type="hidden" name="courseId" value={courseId} />
        <input
          name="titleAr"
          required
          placeholder="اسم الجزء الجديد"
          className={cn(field, 'min-w-48 flex-1')}
        />
        <Button type="submit" variant="tertiary" size="sm">
          <Pending idle="ضيف جزء" busy="لحظة…" />
        </Button>
        {moduleState && !moduleState.ok && (
          <p className="text-sm text-red-600">{moduleState.messageAr}</p>
        )}
      </form>
    </div>
  )
}

function NewLessonForm({
  courseId,
  moduleId,
  onDone,
}: {
  courseId: string
  moduleId: string
  onDone: () => void
}) {
  const [state, action] = useActionState<CurriculumState, FormData>(createLesson, null)

  // The action revalidates, so a successful save re-renders this list with
  // the new lesson in it; closing the form here keeps it from lingering.
  // In an effect, not during render — calling the parent's setState while
  // rendering is a React error, and it would close the form before the
  // list it belongs to has been replaced.
  useEffect(() => {
    if (state?.ok) onDone()
  }, [state, onDone])

  return (
    <form action={action} className="mt-4 space-y-3 rounded-xl bg-cream-50 p-4">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="moduleId" value={moduleId} />

      <div className="flex flex-wrap gap-3">
        <input
          name="titleAr"
          required
          placeholder="اسم الدرس"
          className={cn(field, 'min-w-48 flex-[2]')}
        />
        <input
          name="durationMinutes"
          type="number"
          min={0}
          max={600}
          dir="ltr"
          placeholder="دقايق"
          className={cn(field, 'w-24')}
        />
        <input
          name="slug"
          dir="ltr"
          placeholder="الرابط (اختياري)"
          className={cn(field, 'min-w-40 flex-1')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm">
          <Pending idle="ضيف الدرس" busy="لحظة…" />
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-muted underline underline-offset-4"
        >
          إلغاء
        </button>
        {state && !state.ok && <p className="text-sm text-red-600">{state.messageAr}</p>}
      </div>
    </form>
  )
}

function PreviewButton({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [state, action] = useActionState<CurriculumState, FormData>(setFreePreview, null)

  return (
    <form action={action}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <button
        type="submit"
        className="text-xs text-muted underline underline-offset-4 transition hover:text-gold-600"
        title="اعمله المعاينة المجانية للدورة"
      >
        <Pending idle="اعمله معاينة" busy="…" />
      </button>
      {state && !state.ok && <span className="text-xs text-red-600">{state.messageAr}</span>}
    </form>
  )
}

function DeleteLessonButton({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [state, action] = useActionState<CurriculumState, FormData>(deleteLesson, null)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <button
        type="submit"
        aria-label="امسح الدرس"
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
      {state && !state.ok && <span className="text-xs text-red-600">{state.messageAr}</span>}
    </form>
  )
}

function DeleteModuleButton({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const [state, action] = useActionState<CurriculumState, FormData>(deleteModule, null)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-red-600"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        <Pending idle="امسح الجزء" busy="لحظة…" />
      </button>
      {state && !state.ok && <span className="text-xs text-red-600">{state.messageAr}</span>}
    </form>
  )
}
