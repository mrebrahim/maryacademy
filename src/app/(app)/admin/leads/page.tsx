import { MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

import { LEAD_STATUS_LABELS_AR } from '@/config/checkout'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'الطلبات المتروكة', robots: { index: false } }

/**
 * People who started checkout and did not finish.
 *
 * This is the follow-up list. Without somewhere to read it the capture is
 * inert data, so the WhatsApp link is the point of the page: one tap from
 * a name to a conversation.
 */
export default async function AdminLeadsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('checkout_leads')
    .select('id, name, phone, email, status, utm_source, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = leads ?? []
  const abandoned = rows.filter((l) => l.status === 'abandoned').length

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">الطلبات المتروكة</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        ناس فتحت صفحة الدفع وكتبت بياناتها وما كمّلتش.{' '}
        <span className="tabular font-semibold text-navy-900">{abandoned}</span> منهم لسه ما بدأوش
        الدفع.
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          مفيش بيانات لسه.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-navy-900/8 rounded-card bg-white shadow-soft ring-1 ring-navy-900/5">
          {rows.map((lead) => {
            const digits = (lead.phone ?? '').replace(/\D/g, '')
            // Egyptian local numbers need the country code for wa.me.
            const wa = digits.startsWith('0') ? `2${digits}` : digits

            return (
              <li
                key={lead.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-navy-900">{lead.name || 'بدون اسم'}</p>
                  <p dir="ltr" className="mt-1 truncate text-xs text-muted">
                    {[lead.phone, lead.email].filter(Boolean).join(' · ')}
                  </p>
                  {lead.utm_source && (
                    <p className="mt-1 text-xs text-muted">من: {lead.utm_source}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      lead.status === 'paid'
                        ? 'bg-gold-500/15 text-gold-600'
                        : lead.status === 'started'
                          ? 'bg-navy-900/8 text-navy-900'
                          : 'bg-red-50 text-red-600',
                    )}
                  >
                    {LEAD_STATUS_LABELS_AR[lead.status]}
                  </span>

                  {digits.length >= 10 && (
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(
                        'السلام عليكم، شوفنا إنك بدأت الحجز في الدورة وحابين نساعدك تكمّل.',
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-navy-900/15 px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-gold-500"
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      واتساب
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
