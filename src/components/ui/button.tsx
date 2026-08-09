import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * PRD §3 button system:
 *   primary   — gold fill + navy text
 *   secondary — gold outline on navy
 *   tertiary  — navy fill + white text, for cream sections
 *
 * Spacing uses logical properties (ps-/pe-) so the RTL layout is correct
 * without any direction-specific overrides.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-gold-500 text-navy-900 hover:bg-gold-300',
        secondary: 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-900',
        tertiary: 'bg-navy-900 text-white hover:bg-navy-800',
        ghost: 'text-navy-900 hover:bg-cream-50',
      },
      size: {
        sm: 'h-10 ps-4 pe-4 text-sm',
        md: 'h-12 ps-6 pe-6 text-base',
        lg: 'h-14 ps-8 pe-8 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
