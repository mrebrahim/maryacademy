import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CheckoutShell } from '@/components/checkout/checkout-shell'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/config/site'

export const metadata: Metadata = { title: 'استلمنا طلبك', robots: { index: false } }

/**
 * The end of the flow — and it must work for someone with no account,
 * because that is now the normal case: guests pay first and sign in
 * afterwards to watch.
 *
 * The copy says the transfer is being matched rather than that payment
 * succeeded, because with InstaPay it has not yet: settlement is confirmed
 * by a person. Telling someone "you're in" and then making them wait is how
 * a support queue is built.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <CheckoutShell step={2}>
      <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
        <CheckCircle2 className="mx-auto size-14 text-gold-500" aria-hidden="true" />

        <h1 className="display mt-6 text-2xl text-navy-900 sm:text-3xl">وصلنا طلبك</h1>

        <p className="mt-5 text-base leading-loose text-muted">
          بنطابق التحويل دلوقتي. أول ما يتأكد، بنفتحلك الدورة على طول.
        </p>

        <div className="mt-7 rounded-card bg-white p-6 text-start shadow-soft ring-1 ring-navy-900/5">
          <p className="text-sm font-semibold text-navy-900">إزاي تدخل على الدورة؟</p>
          <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
            <li>
              <span className="tabular font-semibold text-navy-900">1.</span> ادخل على صفحة تسجيل
              الدخول واكتب نفس البريد اللي حجزت بيه
              {email && (
                <>
                  {' — '}
                  <span dir="ltr" className="font-semibold text-navy-900">
                    {email}
                  </span>
                </>
              )}
              .
            </li>
            <li>
              <span className="tabular font-semibold text-navy-900">2.</span> هيوصلك كود على
              البريد، اكتبه وهيتعمل حسابك.
            </li>
            <li>
              <span className="tabular font-semibold text-navy-900">3.</span> الدورة هتكون مضافة
              لحسابك أوتوماتيك أول ما نأكّد التحويل.
            </li>
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            مش لازم تعمل ده دلوقتي — مكانك محجوز بالبريد ده.
          </p>
        </div>

        <div className="mt-8">
          <Button asChild size="lg" className="w-full sm:w-auto sm:px-10">
            <Link href="/login">اعمل حسابك دلوقتي</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted">
          فيه أي استفسار؟{' '}
          <a
            href={whatsappLink('السلام عليكم، حوّلت قيمة الدورة وحابب أتأكد من الحجز')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-600 underline underline-offset-4"
          >
            كلّمنا على واتساب
          </a>
        </p>
      </div>
    </CheckoutShell>
  )
}
