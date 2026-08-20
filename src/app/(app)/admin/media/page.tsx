import { ImageOff } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'

import { ThumbnailUpload } from '@/components/admin/thumbnail-upload'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'صور الدورات — لوحة التحكم',
  robots: { index: false },
}

/**
 * Course thumbnails.
 *
 * The cards on the homepage and the courses page fall back to a patterned
 * placeholder when a course has no thumbnail, which is why they have looked
 * empty: no image has ever been uploaded. This page is how one gets there
 * without a developer in the loop.
 */
export default async function AdminMediaPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title_ar, slug, thumbnail_url')
    .order('created_at')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">صور الدورات</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        الصورة بتظهر على كارت الدورة في الصفحة الرئيسية وصفحة الدورات. الأفضل مقاس عرضي 16:9 —
        مثلًا 1280×720 — وأقل من 5 ميجا.
      </p>

      <ul className="mt-10 space-y-6">
        {(courses ?? []).map((course) => (
          <li
            key={course.id}
            className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5"
          >
            <div className="flex flex-wrap items-start gap-5">
              <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-navy-900/5">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center">
                    <ImageOff className="size-6 text-muted" aria-hidden="true" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-base text-navy-900">{course.title_ar}</h2>
                <p className="mt-1 text-xs text-muted">
                  {course.thumbnail_url ? 'فيه صورة حاليًا' : 'مفيش صورة — الكارت بيظهر بخلفية مزخرفة'}
                </p>
                <div className="mt-4">
                  <ThumbnailUpload courseId={course.id} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {(!courses || courses.length === 0) && (
        <p className="mt-10 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          مفيش دورات لسه.
        </p>
      )}
    </div>
  )
}
