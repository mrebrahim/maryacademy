import { ArrowLeft, BookOpen, Clock, Droplet, Palette, Scissors, Sparkles, Wand2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { courseThumbnails } from '@/config/assets'
import type { Category, Course } from '@/lib/queries'
import { cn, formatDuration } from '@/lib/utils'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  scissors: Scissors,
  palette: Palette,
  sparkles: Sparkles,
  droplet: Droplet,
  wand: Wand2,
}

/** Latin name shown above the Arabic one, matching the mockup's card style. */
const LATIN_NAME: Record<string, string> = {
  'hair-styling': 'Hair Styling',
  'hair-color': 'Hair Color',
  'hair-cutting': 'Hair Cutting',
  makeup: 'Makeup',
  'skin-care': 'Skin Care',
}

function CourseCard({
  icon: Icon,
  latinName,
  nameAr,
  live,
  href,
  meta,
  thumbnail,
}: {
  icon: ComponentType<{ className?: string }>
  latinName: string
  nameAr: string
  live: boolean
  href: string
  meta?: { lessons: number; minutes: number }
  thumbnail?: string
}) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 transition duration-300',
        live
          ? 'shadow-soft ring-gold-500/30 hover:-translate-y-1 hover:shadow-lg hover:ring-gold-500/60'
          : 'ring-navy-900/8 hover:-translate-y-1 hover:shadow-soft',
      )}
    >
      {/* Real 16:9 photography when available, patterned placeholder otherwise. */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-bl from-navy-800 via-navy-900 to-navy-900">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#C9A24B_0,#C9A24B_1px,transparent_1px,transparent_11px)]"
              aria-hidden="true"
            />
            <Icon className="absolute start-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-gold-500/35 transition-transform duration-300 group-hover:scale-110 rtl:translate-x-1/2" />
          </>
        )}

        {live && (
          <span className="absolute end-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-navy-900">
            متاح دلوقتي
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pt-5 pb-5 text-center">
        <h3 className="font-display text-base text-navy-900">{latinName}</h3>
        <p className="mt-1 text-sm text-muted">{nameAr}</p>

        {meta ? (
          <p className="mt-3 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5 text-gold-500" aria-hidden="true" />
              <span className="tabular">{meta.lessons}</span> درس
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-gold-500" aria-hidden="true" />
              {formatDuration(meta.minutes * 60)}
            </span>
          </p>
        ) : (
          <p className="mt-3 rounded-full bg-navy-900/5 px-3 py-1 text-xs font-semibold text-muted">
            قريبًا
          </p>
        )}

        <div className="mt-auto w-full pt-5">
          {live ? (
            <Button asChild variant="tertiary" size="sm" className="w-full">
              <Link href={href}>
                اعرفي المزيد
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full border border-navy-900/15 text-navy-900 hover:border-gold-500 hover:bg-gold-500/10"
            >
              <Link href={href}>سجلي اهتمامك</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export function CoursesGrid({
  courses,
  categories,
}: {
  courses: Course[]
  categories: Category[]
}) {
  // The one published course links to its sales page. Roadmap categories get
  // a "coming soon" card pointing at the waitlist, never a dead link
  // (PRD §7.1.3).
  const liveCourse = courses[0]

  return (
    <section aria-labelledby="courses-heading" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <SectionHeading id="courses-heading" kicker="الدورات" title="اللي بندرّبه" />
          <p className="max-w-md text-base leading-loose text-muted lg:pb-3">
            كورس واحد متاح دلوقتي، والباقي بيتصوّر. سجلي اهتمامك في أي واحدة وهتكوني أول من يعرف.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = ICONS[category.icon ?? 'sparkles'] ?? Sparkles
            const isLive = category.slug === 'hair-styling' && Boolean(liveCourse)

            return (
              <li key={category.id}>
                <CourseCard
                  icon={Icon}
                  latinName={LATIN_NAME[category.slug] ?? category.name_ar}
                  nameAr={category.name_ar}
                  live={isLive}
                  href={
                    isLive
                      ? `/courses/${liveCourse.slug}`
                      : `/courses/interest?category=${category.slug}`
                  }
                  meta={
                    isLive
                      ? {
                          lessons: liveCourse.lesson_count,
                          minutes: liveCourse.total_duration_minutes,
                        }
                      : undefined
                  }
                  // A thumbnail uploaded to Storage wins over the static file.
                  thumbnail={
                    (isLive ? liveCourse.thumbnail_url : null) ??
                    courseThumbnails[category.slug]
                  }
                />
              </li>
            )
          })}
        </ul>

        <div className="mt-14 flex justify-center">
          <Button
            asChild
            variant="secondary"
            size="md"
            className="border-navy-900/25 text-navy-900 hover:bg-navy-900 hover:text-white"
          >
            <Link href="/courses">عرض جميع الدورات</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
