import { cn } from '@/lib/utils'

import { CHECKOUT_STEPS, type CheckoutStep } from '@/config/checkout'

/**
 * Three steps across the top. Purely informational — it tells someone how
 * much is left, which is the question a half-committed buyer is asking.
 */
export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  return (
    <ol className="mx-auto flex max-w-md items-center gap-2">
      {CHECKOUT_STEPS.map((label, index) => {
        const done = index < current
        const active = index === current

        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                'h-1 w-full rounded-full transition-colors',
                done || active ? 'bg-gold-500' : 'bg-white/15',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'text-[11px] sm:text-xs',
                active ? 'font-semibold text-gold-300' : 'text-cream-50/45',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
