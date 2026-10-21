import {
  AlertCircle,
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  GraduationCap,
  TrendingDown,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { cn, formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'لوحة التحكم', robots: { index: false } }

type Readiness = {
  slug: string
  title_ar: string
  status: string
  lessons: number
  with_video: number
  with_quiz: number
  previews: number
}

/**
 * The dashboard.
 *
 * Ordered by what needs doing, not by what is easy to count. The first
 * thing on the page is the queue: a pending order is a woman who has
 * transferred money and is waiting to be let in, and every hour it sits
 * there is an hour she spends wondering whether she has been scammed.
 * Counters come after it, because a number nobody acts on is decoration.
 *
 * The drop-off list is the one genuinely course-shaped thing here: it
 * says which lesson students stop at. On a self-paced course that is the
 * only early warning there is — nobody writes in to say a lesson was
 * confusing, they just stop.
 */
export default async function AdminPage() {
  const supabase = await createClient()

  const [orders, enrollments, lessons, progress, readiness] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, amount, paid_at, created_at, contact_name, contact_email')
      .order('created_at', { ascending: false }),
    supabase.from('enrollments').select('id, progress_percent, completed_at'),
    supabase.from('lessons_public').select('id, title_ar, sort_order').order('sort_order'),
    supabase.from('lesson_progress').select('lesson_id, is_completed'),
    supabase.rpc('get_content_readiness'),
  ])

  const all = orders.data ?? []
  const pending = all.filter((o) => o.status === 'pending')
  const paid = all.filter((o) => o.status === 'paid')

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const thisMonth = paid.filter((o) => o.paid_at && new Date(o.paid_at) >= startOfMonth)
  const revenueThisMonth = thisMonth.reduce((sum, o) => sum + o.amount, 0)

  const students = enrollments.data ?? []
  const avgProgress = students.length
    ? Math.round(students.reduce((s, e) => s + e.progress_percent, 0) / students.length)
    : 0
  const finished = students.filter((s) => s.completed_at).length

  // Completions per lesson, in play order. With no students this is all
  // zeroes, which is honest — and the section says so rather than drawing
  // an empty chart.
  const completedPerLesson = new Map<string, number>()
  for (const row of progress.data ?? []) {
    if (row.is_completed) {
      completedPerLesson.set(row.lesson_id, (completedPerLesson.get(row.lesson_id) ?? 0) + 1)
    }
  }

  const curriculum = (lessons.data ?? [])
    .filter((l) => l.id)
    .map((l) => ({
      id: l.id!,
      title: l.title_ar ?? '',
      completed: completedPerLesson.get(l.id!) ?? 0,
    }))

  const courses = (readiness.data ?? []) as Readiness[]

  const cards = [
    {
      icon: BadgeDollarSign,
      label: 'إيرادات الشهر',
      value: formatPrice(revenueThisMonth),
      note: `${thisMonth.length} عملية مؤكدة`,
    },
    {
      icon: Users,
      label: 'طلاب مشتركين',
      value: String(students.length),
      note: students.length ? 'اشتراكات نشطة' : 'لسه مفيش اشتراكات',
    },
    {
      icon: GraduationCap,
      label: 'متوسط الإنجاز',
      value: `${avgProgress}%`,
      note: finished ? `${finished} خلّصوا الدورة` : 'محدش خلّص الدورة لسه',
    },
  ]

  return (
    <div>
      <h1 className="display text-2xl text-navy-900 sm:text-3xl">لوحة التحكم</h1>

      {/* ---- The queue, first, because it is the only thing that is urgent ---- */}
      {pending.length > 0 ? (
        <Link
          href="/admin/orders"
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card bg-navy-950 p-5 text-white transition hover:bg-navy-900 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden="true" />
            <div>
              <p className="font-semibold">
                <span className="tabular">{pending.length}</span>{' '}
                {pending.length === 1 ? 'طالب حوّل ومستني' : 'طلاب حوّلوا ومستنيين'}
              </p>
              <p className="mt-1 text-sm text-cream-50/70">
                طابق السكرين شوت اللي جه على واتساب وافتحله الدورة.
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-gold-300">
            راجع الطلبات
            <ArrowLeft className="size-4" aria-hidden="true" />
          </span>
        </Link>
      ) : (
        <p className="mt-6 flex items-center gap-2.5 rounded-card bg-white p-5 text-sm text-muted shadow-soft ring-1 ring-navy-900/5">
          <CheckCircle2 className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
          مفيش طلبات مستنية — كل اللي حوّلوا اتفتحلهم.
        </p>
      )}

      {/* ---- Counters ---- */}
      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <li
              key={card.label}
              className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5"
            >
              <Icon className="size-5 text-gold-500" aria-hidden="true" />
              <p className="tabular mt-3 font-display text-2xl text-navy-900">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-navy-900">{card.label}</p>
              <p className="mt-0.5 text-xs text-muted">{card.note}</p>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ---- Content readiness ---- */}
        <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
          <h2 className="text-base font-semibold text-navy-900">جاهزية المحتوى</h2>
          <p className="mt-1 text-xs text-muted">
            الدورة مش جاهزة للبيع غير لما كل درس يكون عليه فيديو.
          </p>

          {courses.length === 0 ? (
            <p className="mt-5 text-sm text-muted">مفيش دورات لسه.</p>
          ) : (
            <ul className="mt-5 space-y-5">
              {courses.map((course) => {
                const missingVideo = course.lessons - course.with_video
                const missingQuiz = course.lessons - course.with_quiz

                return (
                  <li key={course.slug}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-900">{course.title_ar}</p>
                      <span className="tabular text-xs text-muted">
                        {course.lessons} درس
                        {course.status !== 'published' && ' · مسودة'}
                      </span>
                    </div>

                    <dl className="mt-3 space-y-2 text-sm">
                      <Readyline
                        labelAr="فيديوهات"
                        done={course.with_video}
                        total={course.lessons}
                        missingAr={missingVideo > 0 ? `${missingVideo} درس من غير فيديو` : null}
                        href="/admin/content"
                      />
                      <Readyline
                        labelAr="امتحانات"
                        done={course.with_quiz}
                        total={course.lessons}
                        missingAr={missingQuiz > 0 ? `${missingQuiz} درس من غير امتحان` : null}
                        href="/admin/quizzes"
                        optional
                      />
                    </dl>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* ---- Where students stop ---- */}
        <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-4 text-gold-500" aria-hidden="true" />
            <h2 className="text-base font-semibold text-navy-900">فين الطلاب بيقفوا</h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            عدد اللي خلّصوا كل درس. أول رقم بينزل فجأة هو الدرس اللي محتاج مراجعة.
          </p>

          {students.length === 0 ? (
            <p className="mt-5 text-sm text-muted">
              لسه مفيش طلاب، فمفيش بيانات. الجدول ده هيشتغل لوحده أول ما حد يبدأ.
            </p>
          ) : (
            <ol className="mt-5 space-y-2">
              {curriculum.map((lesson, i) => {
                const share = students.length ? (lesson.completed / students.length) * 100 : 0
                const previous = i > 0 ? curriculum[i - 1].completed : null
                // A lesson that lost more than a third of the people who
                // finished the one before it is where the course breaks.
                const bigDrop =
                  previous !== null && previous > 0 && lesson.completed / previous < 0.67

                return (
                  <li key={lesson.id} className="flex items-center gap-3">
                    <span className="tabular w-5 shrink-0 text-xs text-muted">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-navy-900">
                      {lesson.title}
                    </span>
                    <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-navy-900/10">
                      <span
                        className={cn(
                          'block h-full rounded-full',
                          bigDrop ? 'bg-red-500' : 'bg-gold-500',
                        )}
                        style={{ width: `${share}%` }}
                      />
                    </span>
                    <span className="tabular w-6 shrink-0 text-end text-xs text-muted">
                      {lesson.completed}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>

      {/* ---- Recent orders ---- */}
      <section className="mt-6 rounded-card bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-navy-900">آخر الطلبات</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-500"
          >
            كلها
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {all.length === 0 ? (
          <p className="mt-5 text-sm text-muted">لسه مفيش طلبات.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-900/10">
            {all.slice(0, 6).map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-navy-900">
                    {order.contact_name ?? order.contact_email ?? 'بدون اسم'}
                  </p>
                  <p className="tabular mt-0.5 text-xs text-muted">
                    {new Date(order.created_at).toLocaleDateString('ar-EG', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular text-sm font-semibold text-navy-900">
                    {formatPrice(order.amount)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      order.status === 'paid'
                        ? 'bg-gold-500/15 text-gold-700'
                        : order.status === 'pending'
                          ? 'bg-navy-900/10 text-navy-900'
                          : 'bg-red-50 text-red-700',
                    )}
                  >
                    {order.status === 'paid'
                      ? 'مؤكد'
                      : order.status === 'pending'
                        ? 'مستني'
                        : 'مرفوض'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Readyline({
  labelAr,
  done,
  total,
  missingAr,
  href,
  optional = false,
}: {
  labelAr: string
  done: number
  total: number
  missingAr: string | null
  href: string
  optional?: boolean
}) {
  const complete = total > 0 && done === total

  return (
    <div className="flex items-center gap-3">
      <dt className="w-16 shrink-0 text-xs text-muted">{labelAr}</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-3">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-900/10">
          <span
            className={cn(
              'block h-full rounded-full',
              complete ? 'bg-gold-500' : optional ? 'bg-navy-900/30' : 'bg-red-500',
            )}
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </span>
        <span className="tabular shrink-0 text-xs text-muted">
          {done}/{total}
        </span>
      </dd>
      {missingAr && (
        <Link href={href} className="shrink-0 text-xs text-gold-600 hover:text-gold-500">
          {missingAr}
        </Link>
      )}
    </div>
  )
}
