import type { Metadata } from 'next'
import Link from 'next/link'

import { RequestOtpForm } from '@/components/auth/otp-form'

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  robots: { index: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <>
      <h1 className="display text-center text-2xl text-white">تسجيل الدخول</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-cream-50/65">
        سجّل بالبريد الإلكتروني — نفس الخطوة للحساب الجديد والقديم.
      </p>

      <div className="mt-8 rounded-card border border-white/10 bg-navy-900/60 p-6">
        <RequestOtpForm next={next} />
      </div>

      <p className="mt-6 text-center text-xs text-cream-50/45">
        <Link href="/" className="hover:text-gold-300">
          العودة للرئيسية
        </Link>
      </p>
    </>
  )
}
