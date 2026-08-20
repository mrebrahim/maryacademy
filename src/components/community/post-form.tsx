'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { submitPost, type CommunityState } from '@/app/actions/community'
import { Button } from '@/components/ui/button'
import { latinAwareDir } from '@/lib/rtl'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

const KINDS = [
  { value: 'question', labelAr: 'سؤال' },
  { value: 'discussion', labelAr: 'نقاش' },
  { value: 'resource', labelAr: 'مصدر مفيد' },
] as const

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? 'لحظة…' : 'أرسل للمراجعة'}
    </Button>
  )
}

export function PostForm({ groupId, groupSlug }: { groupId: string; groupSlug: string }) {
  const [state, action] = useActionState<CommunityState, FormData>(submitPost, null)
  const [kind, setKind] = useState<(typeof KINDS)[number]['value']>('question')

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="groupSlug" value={groupSlug} />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">نوع المشاركة</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border px-4 py-2 text-sm transition',
                kind === option.value
                  ? 'border-gold-500 bg-gold-500/10 font-semibold text-navy-900'
                  : 'border-navy-900/15 text-muted hover:border-gold-500/50',
              )}
            >
              <input
                type="radio"
                name="kind"
                value={option.value}
                checked={kind === option.value}
                onChange={() => setKind(option.value)}
                className="sr-only"
              />
              {option.labelAr}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="titleAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
          العنوان
        </label>
        <input id="titleAr" name="titleAr" required maxLength={200} className={field} />
      </div>

      <div>
        <label htmlFor="bodyAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
          التفاصيل <span className="font-normal text-muted">(اختياري)</span>
        </label>
        <textarea id="bodyAr" name="bodyAr" rows={4} maxLength={4000} className={field} />
      </div>

      {/* Only a resource requires the link, and the database enforces that
          too — the field is revealed here rather than always shown so the
          form stays short for the common case. */}
      {kind === 'resource' && (
        <div>
          <label htmlFor="linkUrl" className="mb-1.5 block text-sm font-semibold text-navy-900">
            لينك المصدر
          </label>
          <input
            id="linkUrl"
            name="linkUrl"
            type="url"
            required
            dir="rtl"
            onInput={latinAwareDir}
            placeholder="https://"
            className={field}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Submit />
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
  )
}
