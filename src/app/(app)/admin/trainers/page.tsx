import { ExternalLink, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

import { TrainerActions } from '@/components/admin/trainer-actions'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'طلبات المدرّبين', robots: { index: false } }

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  reviewing: 'تحت المراجعة',
  accepted: 'مقبول',
  rejected: 'مرفوض',
}

export default async function AdminTrainersPage() {
  const supabase = await createClient()

  const { data: applications } = await supabase
    .from('trainer_applications')
    .select(
      'id, full_name, phone, email, speciality_ar, years_experience, portfolio_url, about_ar, status, created_at',
    )
    .order('created_at', { ascending: false })

  const rows = applications ?? []
  const open = rows.filter((a) => a.status === 'new' || a.status === 'reviewing').length

  return (
    <div>
      <h1 className="display text-3xl text-navy-900">طلبات المدرّبين</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        اللي قدّموا من صفحة «كن مدرّبًا معنا».{' '}
        <span className="tabular font-semibold text-navy-900">{open}</span> طلب لسه محتاج قرار.
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          مفيش طلبات لسه.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((a) => {
            const digits = a.phone.replace(/\D/g, '')
            const wa = digits.startsWith('0') ? `2${digits}` : digits

            return (
              <li key={a.id} className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base text-navy-900">{a.full_name}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {a.speciality_ar}
                      {typeof a.years_experience === 'number' && (
                        <>
                          {' · '}
                          <span className="tabular">{a.years_experience}</span> سنة خبرة
                        </>
                      )}
                    </p>
                    <p dir="ltr" className="mt-1 text-xs text-muted">
                      {a.phone} · {a.email}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      a.status === 'accepted'
                        ? 'bg-gold-500/15 text-gold-600'
                        : a.status === 'rejected'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-navy-900/8 text-navy-900',
                    )}
                  >
                    {STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </div>

                {a.about_ar && (
                  <p className="mt-4 text-sm leading-loose whitespace-pre-line text-muted">
                    {a.about_ar}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {a.portfolio_url && (
                    <a
                      href={a.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 text-sm text-gold-600 underline underline-offset-4"
                    >
                      شغله
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                  {digits.length >= 10 && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-navy-900/15 px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-gold-500"
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      واتساب
                    </a>
                  )}
                </div>

                <div className="mt-5 border-t border-navy-900/8 pt-4">
                  <TrainerActions id={a.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
