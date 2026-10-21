'use client'

import {
  BadgePercent,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  UserPlus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/**
 * The admin panel's navigation.
 *
 * Grouped by the question being asked rather than by table: "money",
 * "course", "people". The old panel had no persistent nav at all — every
 * screen was reached from a row of buttons on the dashboard and left you
 * with the browser's back button — which is why it felt like a set of
 * pages instead of a tool.
 *
 * Counts are passed in rather than fetched here: a badge is only worth
 * showing when it means something needs doing, and the layout already
 * knows those numbers.
 */

export type AdminBadges = { pendingOrders: number; newApplications: number }

const groups = [
  {
    labelAr: null,
    items: [{ href: '/admin', labelAr: 'نظرة عامة', icon: LayoutDashboard, exact: true }],
  },
  {
    labelAr: 'الفلوس',
    items: [
      { href: '/admin/orders', labelAr: 'الطلبات', icon: ClipboardList, badge: 'pendingOrders' },
      { href: '/admin/leads', labelAr: 'الطلبات المتروكة', icon: Users },
      { href: '/admin/coupons', labelAr: 'أكواد الخصم', icon: BadgePercent },
    ],
  },
  {
    labelAr: 'الدورة',
    items: [
      { href: '/admin/content', labelAr: 'المحتوى والصور', icon: GraduationCap },
      { href: '/admin/quizzes', labelAr: 'الامتحانات', icon: ListChecks },
      { href: '/admin/attachments', labelAr: 'ملفات الدروس', icon: FileText },
    ],
  },
  {
    labelAr: 'الناس',
    items: [
      {
        href: '/admin/trainers',
        labelAr: 'طلبات المدرّبين',
        icon: UserPlus,
        badge: 'newApplications',
      },
    ],
  },
] as const

export function AdminNav({ badges }: { badges: AdminBadges }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-5 lg:overflow-visible lg:pb-0">
      {groups.map((group, i) => (
        <div key={group.labelAr ?? i} className="flex gap-1 lg:flex-col lg:gap-1">
          {group.labelAr && (
            <p className="hidden px-3 pb-1 text-xs font-semibold text-muted lg:block">
              {group.labelAr}
            </p>
          )}

          {group.items.map((item) => {
            const Icon = item.icon
            const active =
              'exact' in item && item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const count =
              'badge' in item ? badges[item.badge as keyof AdminBadges] : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                  active
                    ? 'bg-navy-900 font-semibold text-white'
                    : 'text-navy-900 hover:bg-navy-900/5',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.labelAr}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'tabular ms-auto rounded-full px-2 py-0.5 text-xs font-semibold',
                      active ? 'bg-white/15 text-white' : 'bg-gold-500 text-navy-950',
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
