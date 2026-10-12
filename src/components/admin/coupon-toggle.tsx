'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { setCouponActive, type CouponAdminState } from '@/app/actions/coupons'

function Toggle({ active }: { active: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-navy-900/15 px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-gold-500 disabled:opacity-50"
    >
      {pending ? '…' : active ? 'إيقاف' : 'تفعيل'}
    </button>
  )
}

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const [, action] = useActionState<CouponAdminState, FormData>(setCouponActive, null)

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!active)} />
      <Toggle active={active} />
    </form>
  )
}
