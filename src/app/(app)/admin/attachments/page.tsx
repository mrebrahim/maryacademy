import type { Metadata } from 'next'

import { AttachmentEditor } from '@/components/admin/attachment-editor'
import { createClient } from '@/lib/supabase/server'
import { formatDuration } from '@/lib/utils'

export const metadata: Metadata = { title: 'ملفات الدروس', robots: { index: false } }

type Attachment = { title: string; url: string }

function asAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is Attachment =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Attachment).title === 'string' &&
      typeof (item as Attachment).url === 'string',
  )
}

/**
 * Attach files to lessons.
 *
 * Links rather than uploads, which is what the academy asked for: the PDF
 * lives wherever it already lives — Drive, Dropbox, the media bucket —
 * and the lesson points at it. That keeps large files out of the database
 * and means replacing a file does not need the site touched at all.
 *
 * Reading `lessons` directly here rather than through the view: this page
 * is admin-only by middleware and by RLS, and the view deliberately omits
 * the column.
 */
export default async function AdminAttachmentsPage() {
  const supabase = await createClient()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title_ar, duration_seconds, attachments, course:courses(slug, title_ar)')
    .order('sort_order')

  const rows = lessons ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">ملفات الدروس</h1>
      <p className="mt-3 max-w-xl leading-loose text-muted">
        أي ملف الطالب يحمّله مع الدرس — PDF بالخطوات، قائمة منتجات. الملف بيفضل مكانه وإحنا
        بنحط اللينك بس، فتغيير الملف مش محتاج يتلمس الموقع.
      </p>
      <p className="mt-2 text-sm text-muted">
        الملفات دي بتظهر للمشتركين بس — زيها زي الفيديو.
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-card bg-white px-6 py-10 text-center text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          مفيش دروس لسه.
        </p>
      ) : (
        <ul className="mt-10 space-y-5">
          {rows.map((lesson) => {
            const course = Array.isArray(lesson.course) ? lesson.course[0] : lesson.course
            const existing = asAttachments(lesson.attachments)

            return (
              <li
                key={lesson.id}
                className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base text-navy-900">{lesson.title_ar}</h2>
                  <span className="tabular text-xs text-muted">
                    {formatDuration(lesson.duration_seconds)}
                    {existing.length > 0 && ` · ${existing.length} ملف`}
                  </span>
                </div>

                <div className="mt-4">
                  <AttachmentEditor
                    lessonId={lesson.id}
                    courseSlug={course?.slug ?? ''}
                    initial={existing}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
