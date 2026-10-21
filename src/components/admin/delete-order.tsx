'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { deleteOrder, type AdminActionState } from '@/app/actions/admin'
import { cn } from '@/lib/utils'

function ConfirmButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? '…' : 'أيوه، امسحه'}
    </button>
  )
}

/**
 * Deleting an order is the one action on this screen with nothing left to
 * look at afterwards, so it asks twice — in place, rather than through
 * `window.confirm`, which on Android renders a dialog in the browser's
 * own language and reads as a malfunction on an Arabic page.
 *
 * The second step names what goes with it. An admin clearing test rows
 * and an admin about to revoke a paying student's access are one slip
 * apart, and "امسح" on its own does not tell them which one they are.
 */
export function DeleteOrderButton({
  orderId,
  isPaid,
}: {
  orderId: string
  isPaid: boolean
}) {
  const [asking, setAsking] = useState(false)
  const [state, submit] = useActionState<AdminActionState, FormData>(deleteOrder, null)

  if (state?.ok) {
    return (
      <p role="status" className="text-xs text-muted">
        {state.messageAr}
      </p>
    )
  }

  if (!asking) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="text-xs text-muted underline underline-offset-4 transition hover:text-red-600"
        >
          امسح الطلب
        </button>
        {state && !state.ok && <p className="mt-1 text-xs text-red-600">{state.messageAr}</p>}
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg bg-red-50 p-3 ring-1 ring-red-200')}>
      <p className="text-xs leading-relaxed text-red-800">
        {isPaid
          ? 'الطلب ده مؤكد. مسحه هيشيل كمان وصول الطالب للدورة، وده مش بيترجع من الشاشة دي.'
          : 'هيتمسح نهائي من قايمة الطلبات. استخدمها للطلبات التجريبية بس.'}
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <form action={submit}>
          <input type="hidden" name="orderId" value={orderId} />
          <ConfirmButton />
        </form>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-navy-900"
        >
          إلغاء
        </button>
      </div>
    </div>
  )
}
