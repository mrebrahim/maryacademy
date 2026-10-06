'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { requestOtp, verifyOtp, type OtpState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { OTP_LENGTH, OTP_MAX_LENGTH } from '@/config/auth'
import { latinAwareDir } from '@/lib/rtl'

const field =
  'w-full rounded-lg border border-white/15 bg-navy-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-cream-50/35 focus:border-gold-500'

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'لحظة…' : label}
    </Button>
  )
}

function FormError({ state }: { state: OtpState }) {
  if (!state || state.ok) return null
  return (
    <p role="status" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {state.messageAr}
    </p>
  )
}

export function RequestOtpForm({ next }: { next?: string }) {
  const [state, action] = useActionState<OtpState, FormData>(requestOtp, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm text-cream-50/80">
          الاسم
        </label>
        <input id="fullName" name="fullName" maxLength={120} className={field} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-cream-50/80">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          dir="rtl"
          onInput={latinAwareDir}
          className={field}
        />
      </div>

      {next && <input type="hidden" name="next" value={next} />}

      <Submit label="أرسل كود الدخول" />
      <FormError state={state} />

      <p className="text-center text-xs leading-relaxed text-cream-50/50">
        هيوصلك كود من {OTP_LENGTH} أرقام على بريدك. مفيش كلمة سر تحفظها.
      </p>
    </form>
  )
}

export function VerifyOtpForm({ email, next }: { email: string; next?: string }) {
  const [state, action] = useActionState<OtpState, FormData>(verifyOtp, null)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label htmlFor="token" className="mb-1.5 block text-sm text-cream-50/80">
          كود الدخول
        </label>
        <input
          id="token"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_MAX_LENGTH}
          required
          dir="ltr"
          placeholder={'0'.repeat(OTP_LENGTH)}
          className={`${field} text-center font-display text-2xl tracking-[0.5em]`}
        />
      </div>

      <Submit label="تأكيد الدخول" />
      <FormError state={state} />
    </form>
  )
}
