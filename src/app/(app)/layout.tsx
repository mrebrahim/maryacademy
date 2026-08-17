import Link from 'next/link'

import { signOut } from '@/app/actions/auth'
import { Logo } from '@/components/ui/logo'
import { createClient } from '@/lib/supabase/server'

/**
 * Signed-in shell. Middleware has already guaranteed a session by the time
 * this renders, so the profile lookup here is for display, not for access
 * control — the gates are middleware plus RLS.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()
    : { data: null }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/learn" className="flex items-center gap-3">
            <Logo variant="mark" className="size-9 shrink-0" />
            <span className="font-display text-sm text-white sm:text-base">منطقة التعلّم</span>
          </Link>

          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-sm text-gold-300 hover:text-gold-500">
                لوحة التحكم
              </Link>
            )}
            <span className="hidden text-sm text-cream-50/70 sm:inline">
              {profile?.full_name ?? user?.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-cream-50/60 hover:text-gold-300">
                خروج
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 bg-ivory">
        {children}
      </main>
    </>
  )
}
