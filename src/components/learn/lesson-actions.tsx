'use client'

import { Check } from 'lucide-react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { markLessonComplete, type ProgressState } from '@/app/actions/learn'
import { Button } from '@/components/ui/button'

function CompleteButton({ done }: { done: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="tertiary" size="md" disabled={pending || done}>
      {done ? (
        <>
          <Check aria-hidden="true" />
          تم إنهاء الدرس
        </>
      ) : (
        <>{pending ? 'لحظة…' : 'علّم الدرس كمكتمل'}</>
      )}
    </Button>
  )
}

export function MarkCompleteForm({
  lessonId,
  courseSlug,
  done,
}: {
  lessonId: string
  courseSlug: string
  done: boolean
}) {
  const [state, action] = useActionState<ProgressState, FormData>(markLessonComplete, null)

  // Once the action succeeds the page revalidates and `done` arrives true on
  // the next render; until then the returned state carries the result.
  const isDone = done || Boolean(state?.ok)

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <CompleteButton done={isDone} />

      {state && !state.ok && (
        <p role="status" className="text-sm text-red-600">
          {state.messageAr}
        </p>
      )}
    </form>
  )
}
