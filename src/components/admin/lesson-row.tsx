'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateLesson, type ContentState } from '@/app/actions/content'
import { cn, formatDuration } from '@/lib/utils'

const field =
  'rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-gold-500'

function Save() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-navy-900/15 px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-gold-500 disabled:opacity-50"
    >
      {pending ? '…' : 'حفظ'}
    </button>
  )
}

export function LessonRow({
  lesson,
}: {
  lesson: {
    id: string
    title_ar: string
    sort_order: number
    duration_seconds: number
    is_free_preview: boolean
    has_video: boolean
  }
}) {
  const [state, action] = useActionState<ContentState, FormData>(updateLesson, null)

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 px-5 py-3">
      <input type="hidden" name="id" value={lesson.id} />

      <input
        name="sortOrder"
        type="number"
        min={1}
        dir="ltr"
        defaultValue={lesson.sort_order}
        aria-label="الترتيب"
        className={cn(field, 'w-16 text-center')}
      />

      <input
        name="titleAr"
        defaultValue={lesson.title_ar}
        required
        maxLength={200}
        aria-label="اسم الدرس"
        className={cn(field, 'min-w-44 flex-1')}
      />

      <span className="tabular shrink-0 text-xs text-muted">
        {formatDuration(lesson.duration_seconds)}
      </span>

      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
          lesson.has_video ? 'bg-gold-500/15 text-gold-600' : 'bg-red-50 text-red-600',
        )}
      >
        {lesson.has_video ? 'فيديو' : 'مفيش فيديو'}
      </span>

      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-navy-900">
        <input
          type="checkbox"
          name="isFreePreview"
          value="on"
          defaultChecked={lesson.is_free_preview}
          className="size-4 accent-[#C9A24B]"
        />
        معاينة مجانية
      </label>

      <Save />

      {state && (
        <span className={cn('text-xs', state.ok ? 'text-gold-600' : 'text-red-600')}>
          {state.messageAr}
        </span>
      )}
    </form>
  )
}
