'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { confirmOrder, rejectOrder, type AdminActionState } from '@/app/actions/admin'
import { cn } from '@/lib/utils'

function PendingButton({ label, tone }: { label: string; tone: 'confirm' | 'reject' }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50',
        tone === 'confirm'
          ? 'bg-gold-500 text-navy-900 hover:bg-gold-300'
          : 'border border-navy-900/15 text-muted hover:border-red-300 hover:text-red-600',
      )}
    >
      {pending ? '…' : label}
    </button>
  )
}

export function OrderActions({ orderId }: { orderId: string }) {
  const [confirmState, confirm] = useActionState<AdminActionState, FormData>(confirmOrder, null)
  const [rejectState, reject] = useActionState<AdminActionState, FormData>(rejectOrder, null)
  const state = confirmState ?? rejectState

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <form action={confirm}>
          <input type="hidden" name="orderId" value={orderId} />
          <PendingButton label="تأكيد وفتح الوصول" tone="confirm" />
        </form>

        <form action={reject}>
          <input type="hidden" name="orderId" value={orderId} />
          <PendingButton label="رفض" tone="reject" />
        </form>
      </div>

      {state && (
        <p role="status" className={cn('mt-2 text-xs', state.ok ? 'text-gold-600' : 'text-red-600')}>
          {state.messageAr}
        </p>
      )}
    </div>
  )
}
