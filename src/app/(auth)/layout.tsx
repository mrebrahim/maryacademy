import Link from 'next/link'

import { Logo } from '@/components/ui/logo'

/** Auth screens: logo, the form, nothing to wander off into. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain relative flex flex-1 flex-col bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(201,162,75,0.18),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Link href="/" aria-label="الرئيسية">
          <Logo variant="mark" priority className="size-14" />
        </Link>
        <div className="mt-8 w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
