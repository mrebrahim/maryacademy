import type { Metadata } from 'next'

import { OrderActions } from '@/components/admin/order-actions'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'الطلبات', robots: { index: false } }

const STATUS_LABEL: Record<string, string> = {
  pending: 'في انتظار المراجعة',
  paid: 'مؤكد',
  failed: 'مرفوض',
  refunded: 'مسترجع',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, amount, discount_amount, status, provider_txn_id, created_at, course:courses(title_ar), buyer:profiles(full_name, phone)',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  const rows = orders ?? []
  const pending = rows.filter((o) => o.status === 'pending')

  return (
    <div>
      <h1 className="display text-3xl text-navy-900">الطلبات</h1>
      <p className="mt-3 text-sm text-muted">
        {pending.length
          ? `${pending.length} طلب في انتظار المراجعة`
          : 'مفيش طلبات في انتظار المراجعة'}
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-card bg-white p-10 text-center text-muted shadow-soft ring-1 ring-navy-900/5">
          لسه مفيش طلبات.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((order) => {
            const course = Array.isArray(order.course) ? order.course[0] : order.course
            const buyer = Array.isArray(order.buyer) ? order.buyer[0] : order.buyer

            return (
              <li
                key={order.id}
                className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900">{buyer?.full_name ?? '—'}</p>
                    <p className="mt-1 text-sm text-muted">{course?.title_ar}</p>
                    {buyer?.phone && (
                      <p dir="ltr" className="tabular mt-1 text-xs text-muted">
                        {buyer.phone}
                      </p>
                    )}
                  </div>

                  <div className="text-end">
                    <p className="tabular font-display text-xl text-gold-600">
                      {formatPrice(order.amount)}
                    </p>
                    {order.discount_amount > 0 && (
                      <p className="tabular text-xs text-muted">
                        خصم {formatPrice(order.discount_amount)}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">{STATUS_LABEL[order.status]}</p>
                  </div>
                </div>

                <p className="mt-4 border-t border-navy-900/10 pt-4 text-xs text-muted">
                  {order.provider_txn_id ? (
                    <>
                      مرجع العملية:{' '}
                      <span dir="ltr" className="tabular font-medium text-navy-900">
                        {order.provider_txn_id}
                      </span>
                    </>
                  ) : (
                    // Since the reference field was dropped, matching is done
                    // against the screenshot sent on WhatsApp — by the email
                    // above, which is what the order is recorded under.
                    'طابق السكرين شوت اللي جه على واتساب بالبريد ده قبل التأكيد'
                  )}
                </p>

                {order.status === 'pending' && (
                  <div className="mt-4">
                    <OrderActions orderId={order.id} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
