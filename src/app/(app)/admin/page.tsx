import { BadgeDollarSign, Clock, GraduationCap, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'لوحة التحكم', robots: { index: false } }

/**
 * Admin dashboard. Middleware has already verified the admin role; RLS
 * would deny these reads anyway if it hadn't.
 */
export default async function AdminPage() {
  const supabase = await createClient()

  const [orders, enrollments] = await Promise.all([
    supabase.from('orders').select('status, amount, paid_at'),
    supabase.from('enrollments').select('id, progress_percent, completed_at'),
  ])

  const all = orders.data ?? []
  const pending = all.filter((o) => o.status === 'pending')
  const paid = all.filter((o) => o.status === 'paid')

  const thisMonth = paid.filter(
    (o) => o.paid_at && new Date(o.paid_at) >= new Date(new Date().setDate(1)),
  )
  const revenueThisMonth = thisMonth.reduce((sum, o) => sum + o.amount, 0)

  const students = enrollments.data ?? []
  const avgProgress = students.length
    ? Math.round(students.reduce((s, e) => s + e.progress_percent, 0) / students.length)
    : 0

  const cards = [
    {
      icon: BadgeDollarSign,
      label: 'إيرادات الشهر',
      value: formatPrice(revenueThisMonth),
      note: `${thisMonth.length} عملية مؤكدة`,
    },
    {
      icon: Clock,
      label: 'طلبات في انتظار المراجعة',
      value: String(pending.length),
      note: pending.length ? 'محتاجة تأكيد' : 'مفيش طلبات معلّقة',
      href: '/admin/orders',
    },
    { icon: Users, label: 'طلاب مشتركين', value: String(students.length), note: 'اشتراكات نشطة' },
    {
      icon: GraduationCap,
      label: 'متوسط الإنجاز',
      value: `${avgProgress}%`,
      note: `${students.filter((s) => s.completed_at).length} أنهوا الدورة`,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">لوحة التحكم</h1>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          const body = (
            <div className="h-full rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 transition hover:ring-gold-500/40">
              <Icon className="size-6 text-gold-500" aria-hidden="true" />
              <p className="tabular mt-4 font-display text-3xl text-navy-900">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-navy-900">{card.label}</p>
              <p className="mt-1 text-xs text-muted">{card.note}</p>
            </div>
          )
          return (
            <li key={card.label}>{card.href ? <Link href={card.href}>{body}</Link> : body}</li>
          )
        })}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/orders"
          className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800"
        >
          مراجعة الطلبات
        </Link>
        <Link
          href="/admin/leads"
          className="rounded-lg border border-navy-900/15 px-5 py-3 text-sm font-semibold text-navy-900 transition hover:border-gold-500"
        >
          الطلبات المتروكة
        </Link>
      </div>
    </div>
  )
}
