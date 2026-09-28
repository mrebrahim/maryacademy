'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { CheckoutShell } from '@/components/checkout/checkout-shell'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/config/site'

/**
 * Failure, without blame.
 *
 * Nothing here suggests the person did something wrong — the overwhelmingly
 * common cause is on the bank's side. The retry link carries the course
 * slug back so the form is reachable in one tap rather than making them
 * navigate to it again.
 */
function FailedContent() {
  const params = useSearchParams()
  const slug = params.get('course')

  // Only an internal path; the slug arrives in a URL anyone can craft.
  const retryHref = slug && /^[a-z0-9-]+$/i.test(slug) ? `/checkout/${slug}` : '/courses'

  return (
    <CheckoutShell step={1}>
      <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
        <AlertCircle className="mx-auto size-14 text-gold-500" aria-hidden="true" />

        <h1 className="display mt-6 text-2xl text-navy-900 sm:text-3xl">الدفع ما تمّش</h1>

        <p className="mt-5 text-base leading-loose text-muted">
          غالبًا مشكلة مؤقتة من البنك أو التطبيق. بياناتك زي ما هي — جرّب تاني وهتلاقي كل حاجة
          محفوظة.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={retryHref}>جرّب تاني</Link>
          </Button>
          <Button asChild variant="tertiary" size="lg">
            <a
              href={whatsappLink('السلام عليكم، واجهتني مشكلة في الدفع وحابب أكمل الحجز')}
              target="_blank"
              rel="noopener noreferrer"
            >
              ادفع بطريقة تانية
            </a>
          </Button>
        </div>
      </div>
    </CheckoutShell>
  )
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={null}>
      <FailedContent />
    </Suspense>
  )
}
