import { ArrowRight, Clock, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PostForm } from '@/components/community/post-form'
import { AUDIENCE_LABELS_AR, KIND_LABELS_AR, getGroupBySlug, getGroupPosts } from '@/lib/community'

export const metadata: Metadata = {
  title: 'المجتمع',
  robots: { index: false },
}

type Params = Promise<{ slug: string }>

export default async function CommunityGroupPage({ params }: { params: Params }) {
  const { slug } = await params

  // RLS returns nothing for a group this member does not qualify for, so a
  // group they cannot see is indistinguishable from one that does not
  // exist — which is exactly what should be leaked: nothing.
  const group = await getGroupBySlug(slug)
  if (!group) notFound()

  const posts = await getGroupPosts(group.id)
  const approved = posts.filter((p) => p.status === 'approved')
  const mine = posts.filter((p) => p.status !== 'approved')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        كل المجموعات
      </Link>

      <div className="mt-6">
        <span className="text-xs font-semibold text-gold-600">
          {AUDIENCE_LABELS_AR[group.audience]}
        </span>
        <h1 className="display mt-2 text-3xl text-navy-900">{group.name_ar}</h1>
        {group.description_ar && (
          <p className="mt-3 leading-loose text-muted">{group.description_ar}</p>
        )}
      </div>

      {/* ---- Submit ---- */}
      <section className="mt-10 rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
        <h2 className="text-lg text-navy-900">شارك بسؤال أو نقاش أو مصدر</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          كل المشاركات بتتراجع من الإدارة قبل ما تظهر للباقيين.
        </p>
        <div className="mt-6">
          <PostForm groupId={group.id} groupSlug={group.slug} />
        </div>
      </section>

      {/* ---- The member's own pending submissions ---- */}
      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-navy-900">مشاركاتك تحت المراجعة</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((post) => (
              <li
                key={post.id}
                className="rounded-card border border-dashed border-navy-900/15 bg-white/60 px-5 py-4"
              >
                <p className="flex items-center gap-2 text-xs text-muted">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {post.status === 'pending' ? 'في انتظار المراجعة' : 'اترفضت'}
                </p>
                <p className="mt-1.5 text-sm text-navy-900">{post.title_ar}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- Approved ---- */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-navy-900">المشاركات</h2>

        {approved.length === 0 ? (
          <p className="mt-4 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
            لسه مفيش مشاركات منشورة هنا. كن أول واحد يشارك.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {approved.map((post) => (
              <li
                key={post.id}
                className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-semibold text-gold-600">
                    {KIND_LABELS_AR[post.kind]}
                  </span>
                  <span className="text-muted">{post.author?.full_name ?? 'عضو بالأكاديمية'}</span>
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
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold-600 underline underline-offset-4 hover:text-gold-500"
                  >
                    {post.link_url}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
