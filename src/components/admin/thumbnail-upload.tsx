'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { uploadCourseThumbnail, type MediaState } from '@/app/actions/media'
import { cn } from '@/lib/utils'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
    >
      {pending ? 'بيترفع…' : 'ارفع الصورة'}
    </button>
  )
}

export function ThumbnailUpload({ courseId }: { courseId: string }) {
  const [state, action] = useActionState<MediaState, FormData>(uploadCourseThumbnail, null)

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input
        type="file"
        name="file"
        required
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="max-w-full text-sm text-muted file:me-3 file:rounded-lg file:border-0 file:bg-gold-500/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-900"
      />
      <Submit />

      {state && (
        <p role="status" className={cn('text-sm', state.ok ? 'text-gold-600' : 'text-red-600')}>
          {state.messageAr}
        </p>
      )}
    </form>
  )
}
