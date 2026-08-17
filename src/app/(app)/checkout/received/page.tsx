import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/config/site'

export const metadata: Metadata = { title: 'استلمنا التحويل', robots: { index: false } }

export default function CheckoutReceivedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-24">
      <CheckCircle2 className="mx-auto size-14 text-gold-500" aria-hidden="true" />

      <h1 className="display mt-6 text-2xl text-navy-900 sm:text-3xl">وصلنا طلبك</h1>

      <p className="mt-5 text-base leading-loose text-muted">
        بنراجع التحويل دلوقتي. أول ما يتأكد، هتلاقي الدورة في صفحة «دوراتي» وهيوصلك إشعار على
        بريدك.
      </p>

      <p className="mt-4 text-sm leading-loose text-muted">
        المراجعة بتاخد وقت قصير في أوقات العمل. لو حابب تستعجل، ابعتلنا رقم العملية على واتساب.
      </p>

      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="md">
          <Link href="/learn">دوراتي</Link>
        </Button>
        <Button asChild variant="tertiary" size="md">
          <a
            href={whatsappLink('السلام عليكم، حوّلت قيمة الدورة وحابب أتأكد من الحجز')}
            target="_blank"
            rel="noopener noreferrer"
          >
            تواصل على واتساب
          </a>
        </Button>
      </div>
    </div>
  )
}
