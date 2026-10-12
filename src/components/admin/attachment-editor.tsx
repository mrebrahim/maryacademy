'use client'

import { Plus, X } from 'lucide-react'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { saveAttachments, type AttachmentState } from '@/app/actions/attachments'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-gold-500'

type Row = { title: string; url: string }

function Save() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="tertiary" size="sm" disabled={pending}>
      {pending ? 'لحظة…' : 'حفظ'}
    </Button>
  )
}

export function AttachmentEditor({
  lessonId,
  courseSlug,
  initial,
}: {
  lessonId: string
  courseSlug: string
  initial: Row[]
}) {
  const [state, action] = useActionState<AttachmentState, FormData>(saveAttachments, null)
  const [rows, setRows] = useState<Row[]>(initial.length > 0 ? initial : [{ title: '', url: '' }])

  function update(index: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="courseSlug" value={courseSlug} />

      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <input
            name="title"
            value={row.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="اسم الملف"
            className={cn(field, 'min-w-40 flex-1')}
          />
          <input
            name="url"
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
            dir="ltr"
            placeholder="https://…"
            className={cn(field, 'min-w-56 flex-[2]')}
          />
          <button
            type="button"
            onClick={() => setRows((r) => (r.length === 1 ? [{ title: '', url: '' }] : r.filter((_, j) => j !== i)))}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-navy-900/15 text-muted transition hover:border-red-300 hover:text-red-600"
            aria-label="شيل الملف"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { title: '', url: '' }])}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
        >
          <Plus className="size-4" aria-hidden="true" />
          ملف تاني
        </button>
        <Save />
        {state && (
          <span className={cn('text-sm', state.ok ? 'text-gold-600' : 'text-red-600')}>
            {state.messageAr}
          </span>
        )}
      </div>
    </form>
  )
}
