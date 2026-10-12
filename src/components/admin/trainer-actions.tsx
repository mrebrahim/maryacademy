'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { reviewTrainerApplication, type TrainerState } from '@/app/actions/trainers'
import { cn } from '@/lib/utils'

function Btn({ label, tone }: { label: string; tone: 'accept' | 'reject' | 'neutral' }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50',
        tone === 'accept'
          ? 'bg-gold-500 text-navy-900 hover:bg-gold-300'
          : tone === 'reject'
            ? 'border border-navy-900/15 text-muted hover:border-red-300 hover:text-red-600'
            : 'border border-navy-900/15 text-navy-900 hover:border-gold-500',
      )}
    >
      {pending ? '…' : label}
    </button>
  )
}

export function TrainerActions({ id }: { id: string }) {
  const [state, action] = useActionState<TrainerState, FormData>(reviewTrainerApplication, null)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { status: 'reviewing', label: 'تحت المراجعة', tone: 'neutral' },
            { status: 'accepted', label: 'قبول', tone: 'accept' },
            { status: 'rejected', label: 'رفض', tone: 'reject' },
          ] as const
        ).map((option) => (
          <form key={option.status} action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={option.status} />
            <Btn label={option.label} tone={option.tone} />
          </form>
        ))}
      </div>

      {state && (
        <p className={cn('mt-2 text-xs', state.ok ? 'text-gold-600' : 'text-red-600')}>
          {state.messageAr}
        </p>
      )}
    </div>
  )
}
