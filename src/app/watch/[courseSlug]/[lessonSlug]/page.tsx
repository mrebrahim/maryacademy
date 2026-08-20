import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CurriculumNav } from '@/components/learn/curriculum-nav'
import { MarkCompleteForm } from '@/components/learn/lesson-actions'
import { LessonVideo } from '@/components/learn/lesson-video'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/config/site'
import { buildPlaybackUrl } from '@/lib/bunny'
import { getLessonVideoId, getViewer, getWatchCourse } from '@/lib/learn'
import { formatDuration } from '@/lib/utils'

/**
 * The lesson player.
 *
 * Deliberately outside the /learn gate in middleware, because a free-preview
 * lesson has to be watchable by someone who has never signed in — that is
 * the whole point of a preview. Access is decided per lesson here and, more
 * importantly, again in the database when the video id is fetched.
 */

export const dynamic = 'force-dynamic'

type Params = Promise<{ courseSlug: string; lessonSlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params
  const course = await getWatchCourse(courseSlug)
  const lesson = course?.ordered.find((l) => l.slug === lessonSlug)

  return {
    title: lesson ? `${lesson.title_ar} — ${course?.title_ar}` : 'الدرس',
    robots: { index: false },
  }
}

export default async function WatchPage({ params }: { params: Params }) {
  const { courseSlug, lessonSlug } = await params

  const course = await getWatchCourse(courseSlug)
  if (!course) notFound()

  const index = course.ordered.findIndex((l) => l.slug === lessonSlug)
  if (index === -1) notFound()

  const lesson = course.ordered[index]
  const previous = index > 0 ? course.ordered[index - 1] : null
  const next = index < course.ordered.length - 1 ? course.ordered[index + 1] : null

  const viewer = await getViewer(course.id)
  const canWatch = viewer.isEnrolled || lesson.is_free_preview

  // A locked lesson renders in place rather than redirecting: the person is
  // already looking at the course, and a paywall next to the curriculum sells
  // better than being bounced back to the sales page.
  const videoId = canWatch ? await getLessonVideoId(lesson.id) : null
  const playback = canWatch ? buildPlaybackUrl(videoId) : null
  const isDone = viewer.completedLessonIds.has(lesson.id)

  // The next lesson is only reachable if it is unlocked for this viewer.
  const nextHref = next && (viewer.isEnrolled || next.is_free_preview)
    ? `/watch/${course.slug}/${next.slug}`
    : null

  return (
    <div className="min-h-dvh bg-cream-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href={viewer.isEnrolled ? '/learn' : `/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          {course.title_ar}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
          {/* ---- Player column ---- */}
          <div>
            <LessonVideo playback={playback} locked={!canWatch} title={lesson.title_ar} />

            <div className="mt-6">
              <p className="tabular text-xs text-muted">
                الدرس {index + 1} من {course.ordered.length} ·{' '}
                {formatDuration(lesson.duration_seconds)}
              </p>
              <h1 className="display mt-2 text-2xl text-navy-900">{lesson.title_ar}</h1>
              {lesson.description_ar && (
                <p className="mt-4 leading-loose text-muted">{lesson.description_ar}</p>
              )}
            </div>

            {/* ---- Paywall, for a preview viewer who is not subscribed ---- */}
            {!viewer.isEnrolled && (
              <div className="mt-8 rounded-card bg-navy-950 p-6 text-white sm:p-8">
                <h2 className="display text-xl text-white">
                  {lesson.is_free_preview
                    ? 'عجبك الدرس؟ باقي الدورة في انتظارك'
                    : 'الدرس ده للمشتركين'}
                </h2>
                <p className="mt-3 text-sm leading-loose text-cream-50/75">
                  اشترك في الدورة عشان تفتح كل الدروس، وتحمّل الملفات، وتاخد شهادة إتمام باسمك.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="md">
                    <Link href="/pricing">شوف الأسعار والاشتراك</Link>
                  </Button>
                  <Button asChild variant="secondary" size="md">
                    <a
                      href={whatsappLink('أريد الاشتراك بالكورسات')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle aria-hidden="true" />
                      تواصل مع الفريق للحجز
                    </a>
                  </Button>
                </div>
                {!viewer.userId && (
                  <p className="mt-5 text-xs text-cream-50/55">
                    مشترك بالفعل؟{' '}
                    <Link href="/login" className="text-gold-300 underline underline-offset-4">
                      سجّل الدخول
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* ---- Progress and navigation ---- */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-navy-900/10 pt-6">
              {viewer.isEnrolled ? (
                <MarkCompleteForm lessonId={lesson.id} courseSlug={course.slug} done={isDone} />
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                {previous && (viewer.isEnrolled || previous.is_free_preview) && (
                  <Button asChild variant="ghost" size="md" className="border border-navy-900/15">
                    <Link href={`/watch/${course.slug}/${previous.slug}`}>
                      <ArrowRight aria-hidden="true" />
                      السابق
                    </Link>
                  </Button>
                )}

                {nextHref ? (
                  <Button asChild size="md">
                    <Link href={nextHref}>
                      الدرس التالي
                      <ArrowLeft aria-hidden="true" />
                    </Link>
                  </Button>
                ) : next ? (
                  // There is a next lesson, but it is locked for this viewer.
                  <Button asChild size="md">
                    <Link href="/pricing">
                      افتح الدرس التالي
                      <ArrowLeft aria-hidden="true" />
                    </Link>
                  </Button>
                ) : (
                  viewer.isEnrolled && (
                    <Button asChild variant="tertiary" size="md">
                      <Link href="/learn">خلصت الدورة — ارجع لدوراتي</Link>
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ---- Curriculum ---- */}
          <aside className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto">
            <CurriculumNav
              courseSlug={course.slug}
              modules={course.modules}
              currentLessonId={lesson.id}
              completedLessonIds={viewer.completedLessonIds}
              isEnrolled={viewer.isEnrolled}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
