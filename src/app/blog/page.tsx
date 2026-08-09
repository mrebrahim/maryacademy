import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { getPublishedPosts } from '@/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'المدونة',
  description: 'نصايح وشروحات في تصفيف الشعر والمكياج والعناية بالبشرة.',
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <PageHeader
        title="المدونة"
        subtitle="نصايح وشروحات مجانية من خبرة سنين في التدريب."
      />

      <section className="bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          {posts.length === 0 ? (
            <div className="rounded-card bg-white p-10 text-center shadow-soft ring-1 ring-navy-900/5">
              <p className="text-lg text-navy-900">لسه مفيش مقالات منشورة</p>
              <p className="mt-3 text-sm text-muted">
                بنجهز أول المقالات دلوقتي. اشتركي في النشرة البريدية تحت وهنبلغك أول ما تنزل.
              </p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5"
                >
                  <h2 className="text-lg text-navy-900">{post.title_ar}</h2>
                  {post.excerpt_ar && (
                    <p className="mt-3 text-sm leading-loose text-muted">{post.excerpt_ar}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
