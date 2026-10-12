import { Award } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/learn/print-button'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'شهادة الإتمام', robots: { index: false } }

/**
 * The certificate.
 *
 * The serial has been minted by the database since the very first
 * migration — `recalculate_enrollment_progress` stamps one the moment an
 * enrolment reaches 100% — but nothing ever showed it. A certificate the
 * student cannot see is not a certificate.
 *
 * Printing rather than generating a PDF: the browser's own "save as PDF"
 * produces a better-looking, correctly-shaped Arabic document than any
 * PDF library would without a lot of font work, and it costs no
 * dependency. The print stylesheet lives in globals.css.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title_ar, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) notFound()

  // Filtered by user_id: the enrolments policy also admits admins, and an
  // admin must not be handed somebody else's certificate.
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('certificate_serial, completed_at, progress_percent')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  // No serial means the course is not finished. Say what is left rather
  // than 404ing — the person followed a link they were given.
  if (!enrollment?.certificate_serial) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
        <Award className="mx-auto size-12 text-gold-500/60" aria-hidden="true" />
        <h1 className="display mt-6 text-2xl text-navy-900">الشهادة لسه مش جاهزة</h1>
        <p className="mt-4 leading-loose text-muted">
          الشهادة بتتصدر أول ما تخلّص كل دروس الدورة.
          {typeof enrollment?.progress_percent === 'number' && (
            <>
              {' '}
              إنت خلّصت{' '}
              <span className="tabular font-semibold text-navy-900">
                {enrollment.progress_percent}%
              </span>
              .
            </>
          )}
        </p>
        <Button asChild size="md" className="mt-8">
          <Link href={`/watch/${course.slug}`}>كمّل الدورة</Link>
        </Button>
      </div>
    )
  }

  const issued = enrollment.completed_at
    ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(
        new Date(enrollment.completed_at),
      )
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/learn" className="text-sm text-muted hover:text-navy-900">
          رجوع لدوراتي
        </Link>
        {/* Print is the download: the browser's own PDF export handles
            Arabic shaping correctly and needs no library. */}
        <PrintButton label="حمّل الشهادة" />
      </div>

      <article className="certificate mt-6 rounded-card border-4 border-double border-gold-500/50 bg-white p-8 text-center shadow-soft sm:p-14">
        <p className="kicker text-gold-600">{siteConfig.nameAr}</p>

        <h1 className="display mt-8 text-3xl text-navy-900 sm:text-4xl">شهادة إتمام</h1>

        <p className="mt-8 text-sm text-muted">تشهد الأكاديمية بأن</p>
        <p className="display mt-3 text-2xl text-navy-900 sm:text-3xl">
          {profile?.full_name || 'المتدرب/المتدربة'}
        </p>

        <p className="mt-7 text-sm text-muted">قد أتمّ بنجاح</p>
        <p className="mt-3 text-lg font-semibold text-navy-900">{course.title_ar}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-navy-900/10 pt-7 text-sm">
          <span className="text-muted">
            رقم الشهادة:{' '}
            <span dir="ltr" className="tabular font-semibold text-navy-900">
              {enrollment.certificate_serial}
            </span>
          </span>
          {issued && <span className="text-muted">تاريخ الإصدار: {issued}</span>}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          تحت إشراف المؤسِّسة Marie Ragaie
        </p>
      </article>

      <p className="mt-5 text-center text-xs text-muted print:hidden">
        رقم الشهادة ده خاص بيك — احتفظ بيه للتوثيق.
      </p>
    </div>
  )
}
