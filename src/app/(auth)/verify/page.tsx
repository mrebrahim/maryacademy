import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { VerifyOtpForm } from '@/components/auth/otp-form'

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
        بعتنا كود من 6 أرقام على
        <br />
        <span dir="ltr" className="text-gold-300">
          {email}
        </span>
      </p>

      <div className="mt-8 rounded-card border border-white/10 bg-navy-900/60 p-6">
        <VerifyOtpForm email={email} next={next} />
      </div>

      <p className="mt-6 text-center text-xs text-cream-50/45">
        الكود ما وصلش؟{' '}
        <Link href="/login" className="text-gold-300 hover:text-gold-500">
          اطلب كود جديد
        </Link>
      </p>
    </>
  )
}
