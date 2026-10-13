import type { Metadata } from 'next'

import { CouponForm } from '@/components/admin/coupon-form'
import { CouponToggle } from '@/components/admin/coupon-toggle'
import { createClient } from '@/lib/supabase/server'
import { cn, formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'أكواد الخصم', robots: { index: false } }

export default async function AdminCouponsPage() {
  const supabase = await createClient()

  const [{ data: courses }, { data: coupons }] = await Promise.all([
    supabase.from('courses').select('id, title_ar').order('title_ar'),
    supabase
      .from('coupons')
      .select(
        'id, code, type, value, is_active, redemption_count, max_redemptions, expires_at, course_id',
      )
      .order('created_at', { ascending: false }),
  ])

  const courseName = new Map((courses ?? []).map((c) => [c.id, c.title_ar]))
  const now = Date.now()

  return (
    <div>
      <h1 className="display text-3xl text-navy-900">أكواد الخصم</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        الخصم بيتحسب في قاعدة البيانات وقت الحجز، فالكود مش ممكن يتلاعب بيه من المتصفح.
      </p>

      <section className="mt-10 rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
        <h2 className="text-lg text-navy-900">كود جديد</h2>
        <div className="mt-6">
          <CouponForm courses={courses ?? []} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg text-navy-900">الأكواد الحالية</h2>

        {!coupons || coupons.length === 0 ? (
          <p className="mt-4 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
            مفيش أكواد لسه.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-900/8 rounded-card bg-white shadow-soft ring-1 ring-navy-900/5">
            {coupons.map((c) => {
              const expired = c.expires_at ? new Date(c.expires_at).getTime() < now : false
              const exhausted =
                c.max_redemptions !== null && c.redemption_count >= c.max_redemptions
              // "Active" is three separate conditions in the database, and
              // a code that is switched on but expired looks identical to a
              // working one unless the list says otherwise.
              const usable = c.is_active && !expired && !exhausted

              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p dir="ltr" className="font-semibold text-navy-900">
                      {c.code}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)} ·{' '}
                      {c.course_id ? (courseName.get(c.course_id) ?? 'دورة محذوفة') : 'كل الدورات'}
                      {' · '}
                      <span className="tabular">
                        {c.redemption_count}
                        {c.max_redemptions ? `/${c.max_redemptions}` : ''} استخدام
                      </span>
                      {c.expires_at && (
                        <>
                          {' · '}
                          ينتهي{' '}
                          {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                            new Date(c.expires_at),
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        usable ? 'bg-gold-500/15 text-gold-600' : 'bg-navy-900/8 text-muted',
                      )}
                    >
                      {usable
                        ? 'شغّال'
                        : expired
                          ? 'منتهي'
                          : exhausted
                            ? 'وصل الحد'
                            : 'موقوف'}
                    </span>
                    <CouponToggle id={c.id} active={c.is_active} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
