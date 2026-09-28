import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CheckoutShell } from '@/components/checkout/checkout-shell'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'استلمنا طلبك', robots: { index: false } }

/**
 * The end of the flow.
 *
 * The copy says the transfer is being matched rather than that payment
 * succeeded, because with InstaPay it has not yet: settlement is confirmed
 * by a person. Telling someone "you're in" and then making them wait is how
 * a support queue is built.
 */
export default async function CheckoutSuccessPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The most recent pending order gives the reference number to quote.
  const { data: order } = await supabase
    .from('orders')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const reference = order?.id.slice(0, 8).toUpperCase()

  return (
    <CheckoutShell step={2}>
      <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
        <CheckCircle2 className="mx-auto size-14 text-gold-500" aria-hidden="true" />

        <h1 className="display mt-6 text-2xl text-navy-900 sm:text-3xl">وصلنا طلبك</h1>

        {reference && (
          <p className="mt-3 text-sm text-muted">
            رقم الطلب: <span dir="ltr" className="tabular font-semibold text-navy-900">{reference}</span>
          </p>
        )}

        <p className="mt-5 text-base leading-loose text-muted">
          بنطابق التحويل دلوقتي. أول ما يتأكد، هتلاقي الدورة في صفحة «دوراتي».
        </p>

        {user?.email && (
          <p className="mt-4 text-sm leading-loose text-muted">
            بعتنالك الإيميل كمان على{' '}
            <span dir="ltr" className="font-semibold text-navy-900">
              {user.email}
            </span>
            . لو مش لاقيه، بصّ في الـ spam.
          </p>
        )}

        <div className="mt-9">
          <Button asChild size="lg" className="w-full sm:w-auto sm:px-10">
            <Link href="/learn">ادخل على دوراتي</Link>
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
