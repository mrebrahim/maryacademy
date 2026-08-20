import { MessagesSquare, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { AUDIENCE_LABELS_AR, getVisibleGroups } from '@/lib/community'

export const metadata: Metadata = {
  title: 'المجتمع',
  robots: { index: false },
}

/**
 * The groups this member can see.
 *
 * There is no "create a group" button anywhere on this page by design —
 * groups are an editorial decision, made by the academy from the admin
 * panel. Members contribute posts, and those wait for approval.
 */
export default async function CommunityPage() {
  const groups = await getVisibleGroups()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">المجتمع</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        مساحات للنقاش والأسئلة والمصادر المفيدة. تقدر تشارك بسؤال أو نقاش أو مصدر، وتظهر مشاركتك بعد
        مراجعة الإدارة.
      </p>

      {groups.length === 0 ? (
        <div className="mt-10 rounded-card bg-white p-10 text-center shadow-soft ring-1 ring-navy-900/5">
          <Users className="mx-auto size-10 text-gold-500" aria-hidden="true" />
          <p className="mt-5 text-lg text-navy-900">مفيش مجموعات متاحة ليك دلوقتي</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-loose text-muted">
            المجموعات بتتفتح حسب الدورات اللي مشترك فيها. أول ما تشترك في دورة، هتلاقي مجتمعها هنا.
          </p>
          <Button asChild size="md" className="mt-7">
            <Link href="/courses">تصفّح الدورات</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/community/${group.slug}`}
                className="flex h-full flex-col rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:ring-gold-500/40"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-gold-600">
                  <MessagesSquare className="size-4" aria-hidden="true" />
                  {AUDIENCE_LABELS_AR[group.audience]}
                </span>
                <h2 className="mt-3 text-lg text-navy-900">{group.name_ar}</h2>
                {group.description_ar && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{group.description_ar}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
