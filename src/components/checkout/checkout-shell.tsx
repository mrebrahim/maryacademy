import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { CheckoutSteps } from '@/components/checkout/checkout-steps'
import { Logo } from '@/components/ui/logo'
import type { CheckoutStep } from '@/config/checkout'

/**
 * The closed checkout shell.
 *
 * No navigation, no footer links, nothing that opens a new tab. Someone on
 * this page has already decided; every link out is a chance to lose them.
 * The one way back is a single small control, which keeps it from feeling
 * like a trap without advertising the exit.
 */
export function CheckoutShell({
  step,
  backHref,
  backLabelAr,
  children,
}: {
  step: CheckoutStep
  backHref?: string
  backLabelAr?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-cream-50">
      <header className="bg-navy-950 pb-5 pt-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Logo variant="mark" className="size-9 shrink-0" />
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm text-cream-50/60 transition hover:text-gold-300"
              >
                <ArrowRight className="size-4" aria-hidden="true" />
                {backLabelAr ?? 'رجوع'}
              </Link>
            )}
          </div>

          <div className="mt-5">
            <CheckoutSteps current={step} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
