'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import type { ContactFormState } from '@/app/actions/interest'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'جاري الإرسال…' : label}
    </Button>
  )
}

export function LeadForm({
  action,
  submitLabel = 'ابعتي',
  withMessage = true,
}: {
  action: (prev: ContactFormState, formData: FormData) => Promise<ContactFormState>
  submitLabel?: string
  withMessage?: boolean
}) {
  const [state, formAction] = useActionState<ContactFormState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="lead-name" className="mb-1.5 block text-sm font-semibold text-navy-900">
          الاسم
        </label>
        <input id="lead-name" name="name" required maxLength={120} className={field} />
      </div>

      <div>
        <label htmlFor="lead-email" className="mb-1.5 block text-sm font-semibold text-navy-900">
          البريد الإلكتروني
        </label>
        <input id="lead-email" name="email" type="email" required dir="ltr" className={field} />
      </div>

      <div>
        <label htmlFor="lead-phone" className="mb-1.5 block text-sm font-semibold text-navy-900">
          رقم الموبايل <span className="font-normal text-muted">(اختياري)</span>
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          dir="ltr"
          inputMode="numeric"
          placeholder="01xxxxxxxxx"
          className={field}
        />
      </div>

      {withMessage && (
        <div>
          <label
            htmlFor="lead-message"
            className="mb-1.5 block text-sm font-semibold text-navy-900"
          >
            رسالتك
          </label>
          <textarea id="lead-message" name="message" rows={4} maxLength={1000} className={field} />
        </div>
      )}

      <Submit label={submitLabel} />

      {state && (
        <p
          role="status"
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            state.ok ? 'bg-gold-500/15 text-navy-900' : 'bg-red-50 text-red-700',
          )}
        >
          {state.messageAr}
        </p>
      )}
    </form>
  )
}
