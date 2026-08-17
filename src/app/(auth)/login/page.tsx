import type { Metadata } from 'next'
import Link from 'next/link'

import { RequestOtpForm } from '@/components/auth/otp-form'

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  robots: { index: false },
}

/**
 * Failures the /auth/callback handler can redirect back with. A link opened
 * on a different device than the one that asked for it cannot carry the
 * verifier cookie, so the message points at the six-digit code instead.
 */
const ERRORS: Record<string, string> = {
  link_failed: 'الرابط ده مش صالح — افتحه من نفس الجهاز اللي طلبت منه الكود، أو اطلب كودًا جديدًا واكتبه هنا.',
  missing_code: 'الرابط ناقص. اطلب كودًا جديدًا من فضلك.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <>
      <h1 className="display text-center text-2xl text-white">تسجيل الدخول</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-cream-50/65">
        سجّل بالبريد الإلكتروني — نفس الخطوة للحساب الجديد والقديم.
      </p>

      {error && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm leading-relaxed text-red-200"
        >
          {ERRORS[error] ?? 'تعذّر تسجيل الدخول، جرّب مرة أخرى.'}
        </p>
      )}

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
