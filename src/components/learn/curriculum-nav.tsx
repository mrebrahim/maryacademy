import { Check, Lock, Play } from 'lucide-react'
import Link from 'next/link'

import type { WatchModule } from '@/lib/learn'
import { cn, formatDuration } from '@/lib/utils'

/**
 * The lesson list beside the player.
 *
 * A locked lesson is still listed, with its title and length visible.
 * Hiding it would leave someone who has not subscribed unable to see what
 * they would be buying, which is the opposite of what a sales surface
 * should do.
 */
export function CurriculumNav({
  courseSlug,
  modules,
  currentLessonId,
  completedLessonIds,
  isEnrolled,
}: {
  courseSlug: string
  modules: WatchModule[]
  currentLessonId: string
  completedLessonIds: Set<string>
  isEnrolled: boolean
}) {
  return (
    <nav aria-label="دروس الدورة" className="space-y-6">
      {modules.map((module) => (
        <div key={module.id}>
          <h2 className="text-sm font-semibold text-navy-900">{module.title_ar}</h2>

          <ol className="mt-3 space-y-1">
            {module.lessons.map((lesson) => {
              const isCurrent = lesson.id === currentLessonId
              const isDone = completedLessonIds.has(lesson.id)
              const canOpen = isEnrolled || lesson.is_free_preview

              const body = (
                <>
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full',
                      isDone
                        ? 'bg-gold-500 text-navy-900'
                        : isCurrent
                          ? 'bg-navy-900 text-white'
                          : 'bg-navy-900/8 text-muted',
                    )}
                  >
                    {isDone ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : canOpen ? (
                      <Play className="size-3" aria-hidden="true" />
                    ) : (
                      <Lock className="size-3" aria-hidden="true" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{lesson.title_ar}</span>
                    <span className="tabular mt-0.5 block text-xs text-muted">
                      {formatDuration(lesson.duration_seconds)}
                      {!isEnrolled && lesson.is_free_preview && (
                        <span className="ms-2 text-gold-600">معاينة مجانية</span>
                      )}
                    </span>
                  </span>
                </>
              )

              const shared = cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition',
                isCurrent ? 'bg-gold-500/12 text-navy-900' : 'text-navy-900/80',
              )

              return (
                <li key={lesson.id}>
                  {canOpen ? (
                    <Link
                      href={`/watch/${courseSlug}/${lesson.slug}`}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={cn(shared, !isCurrent && 'hover:bg-navy-900/5')}
                    >
                      {body}
                    </Link>
                  ) : (
                    <span className={cn(shared, 'cursor-not-allowed opacity-55')}>{body}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </nav>
  )
}
