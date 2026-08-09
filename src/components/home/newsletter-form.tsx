'use client'

import { Send } from 'lucide-react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { subscribeToNewsletter, type LeadFormState } from '@/app/actions/leads'
import { cn } from '@/lib/utils'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="اشتراك"
      className="grid size-10 shrink-0 place-items-center rounded-lg bg-gold-500 text-navy-900 transition hover:bg-gold-300 disabled:opacity-50"
    >
      <Send className="size-5" aria-hidden="true" />
    </button>
  )
}

export function NewsletterForm() {
  const [state, action] = useActionState<LeadFormState, FormData>(subscribeToNewsletter, null)

  return (
    <div>
      <form action={action} className="flex items-center gap-2 rounded-lg bg-white p-1.5">
        <label htmlFor="newsletter-email" className="sr-only">
          البريد الإلكتروني
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          dir="ltr"
          placeholder="اكتبي بريدك الإلكتروني"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-start placeholder:text-muted"
        />
        <SubmitButton />
      </form>

      {state && (
        <p
          role="status"
          className={cn('mt-2 text-xs', state.ok ? 'text-gold-300' : 'text-red-300')}
        >
          {state.messageAr}
        </p>
      )}
    </div>
  )
}
