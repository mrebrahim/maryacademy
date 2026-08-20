import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

import { GroupForm } from '@/components/community/group-form'
import { ModerationActions } from '@/components/community/moderation-actions'
import { AUDIENCE_LABELS_AR, KIND_LABELS_AR, getPendingPosts } from '@/lib/community'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'المجتمع — لوحة التحكم',
  robots: { index: false },
}

/**
 * Admin community screen: create a group, and clear the queue.
 *
 * Middleware keeps non-admins off /admin, and RLS keeps them out of the
 * data even if it did not. Both, deliberately — the first is a redirect,
 * the second is the actual boundary.
 */
export default async function AdminCommunityPage() {
  const supabase = await createClient()

  const [{ data: courses }, { data: groups }, pending] = await Promise.all([
    supabase.from('courses').select('id, title_ar').eq('status', 'published').order('title_ar'),
    supabase
      .from('community_groups')
      .select('id, name_ar, slug, audience, is_general, is_active')
      .order('created_at', { ascending: false }),
    getPendingPosts(),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">المجتمع</h1>

      {/* ---- Queue first: it is the thing that goes stale. ---- */}
      <section className="mt-10">
        <h2 className="text-lg text-navy-900">
          مشاركات في انتظار المراجعة{' '}
          <span className="tabular text-sm text-muted">({pending.length})</span>
        </h2>

        {pending.length === 0 ? (
          <p className="mt-4 rounded-card bg-white px-6 py-8 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
            مفيش حاجة مستنية مراجعة.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pending.map((post) => (
              <li
                key={post.id}
                className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-semibold text-gold-600">
                    {KIND_LABELS_AR[post.kind]}
                  </span>
                  <span className="text-muted">{post.group_name}</span>
                  <span className="text-muted">
                    {post.author?.full_name ?? 'عضو بالأكاديمية'}
                  </span>
                </div>

                <h3 className="mt-3 text-base text-navy-900">{post.title_ar}</h3>

                {post.body_ar && (
                  <p className="mt-2 text-sm leading-loose whitespace-pre-line text-muted">
                    {post.body_ar}
                  </p>
                )}

                {post.link_url && (
                  <a
                    href={post.link_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    dir="ltr"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold-600 underline underline-offset-4"
                  >
                    {post.link_url}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}

                <div className="mt-5">
                  <ModerationActions postId={post.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- Create ---- */}
      <section className="mt-14">
        <h2 className="text-lg text-navy-900">إنشاء جروب جديد</h2>
        <div className="mt-4 rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
          <GroupForm courses={courses ?? []} />
        </div>
      </section>

      {/* ---- Existing ---- */}
      {groups && groups.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg text-navy-900">الجروبات الحالية</h2>
          <ul className="mt-4 divide-y divide-navy-900/8 rounded-card bg-white shadow-soft ring-1 ring-navy-900/5">
            {groups.map((group) => (
              <li key={group.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-sm text-navy-900">{group.name_ar}</p>
                  <p className="mt-1 text-xs text-muted">
                    {AUDIENCE_LABELS_AR[group.audience]} ·{' '}
                    {group.is_general ? 'جروب عام' : 'دورات محددة'}
                    {!group.is_active && ' · موقوف'}
                  </p>
                </div>
                <span dir="ltr" className="text-xs text-muted">
                  /community/{group.slug}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
