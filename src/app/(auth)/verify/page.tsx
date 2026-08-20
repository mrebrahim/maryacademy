import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { VerifyOtpForm } from '@/components/auth/otp-form'
import { OTP_LENGTH } from '@/config/auth'

export const metadata: Metadata = {
  title: 'تأكيد الدخول',
  robots: { index: false },
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>
}) {
  const { email, next } = await searchParams

  // Landing here without an email means the flow was skipped or the link was
  // shared — start over rather than showing an unusable form.
  if (!email) redirect('/login')

  return (
    <>
      <h1 className="display text-center text-2xl text-white">اكتب الكود</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-cream-50/65">
        بعتنا كود من {OTP_LENGTH} أرقام على
        <br />
        <span dir="ltr" className="text-gold-300">
          {email}
        </span>
      </p>

      <div className="mt-8 rounded-card border border-white/10 bg-navy-900/60 p-6">
        <VerifyOtpForm email={email} next={next} />
      </div>

      {/* A mistyped address is the common failure here — it is still a valid
          address, so nothing rejects it and the code simply goes nowhere.
          The way out has to be visible on this screen, not guessed at. */}
      <p className="mt-6 text-center text-xs leading-relaxed text-cream-50/45">
        الكود ما وصلش، أو البريد مكتوب غلط؟{' '}
        <Link href="/login" className="text-gold-300 hover:text-gold-500">
          ارجع وصحّح البريد
        </Link>
      </p>
    </>
  )
}
