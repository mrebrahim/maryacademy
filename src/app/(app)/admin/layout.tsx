import { AdminNav } from '@/components/admin/admin-nav'
import { createClient } from '@/lib/supabase/server'

/**
 * The admin shell.
 *
 * The two counts here are fetched once for the whole panel rather than on
 * each screen, because they are the only things in it that are urgent: a
 * pending order is someone who has paid and is waiting, and an unread
 * application is someone waiting on an answer. Carrying them in the
 * navigation means the academy sees them from wherever it happens to be.
 *
 * Access is already settled before this renders — middleware checks the
 * role and RLS refuses these reads to anyone else — so there is no gate
 * here, only layout.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ count: pendingOrders }, { count: newApplications }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('trainer_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
  ])

  return (
    <div className="mx-auto max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[14rem_1fr] lg:py-12">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <AdminNav
          badges={{ pendingOrders: pendingOrders ?? 0, newApplications: newApplications ?? 0 }}
        />
      </aside>

      <div className="min-w-0 pt-4 lg:pt-0">{children}</div>
    </div>
  )
}
