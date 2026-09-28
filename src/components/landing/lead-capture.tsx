'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { submitCourseInterest, type ContactFormState } from '@/app/actions/interest'
import { Button } from '@/components/ui/button'
import { latinAwareDir } from '@/lib/rtl'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-white/15 bg-navy-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-cream-50/35 focus:border-gold-500'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'جارٍ الإرسال…' : 'ابعتلي التفاصيل'}
    </Button>
  )
}

/**
 * Second-chance capture for visitors who will not buy today.
 *
 * Marie's research says an ad run brings her around 400 messages, very few
 * book, and the rest are lost — she has no way to keep their details or
 * reach them again. Everyone who reads this far and leaves is paid-for
 * traffic thrown away. This keeps them: the row lands in `leads` tagged
 * `course_interest` and attributed to the course, so a follow-up has
 * something to follow up on.
 *
 * Deliberately not an exit-intent popup. Exit intent fires on mouse-leave,
 * which does not exist on the phones most of this audience is browsing on,
 * and it interrupts the people who were still reading.
 */
export function LeadCapture({ courseId }: { courseId: string | null }) {
  const [state, action] = useActionState<ContactFormState, FormData>(submitCourseInterest, null)

  return (
    <section className="bg-navy-900">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-card border border-gold-500/25 bg-navy-800 p-6 sm:p-9">
          <h2 className="display text-2xl text-white sm:text-3xl">لسه مش جاهز دلوقتي؟</h2>
          <p className="mt-4 text-base leading-loose text-cream-50/75">
            سيب بياناتك، وهنبعتلك تفاصيل الكورس كاملة ومواعيد فتح الحجز. من غير أي التزام.
          </p>

          {state?.ok ? (
            <p
              role="status"
              className="mt-7 rounded-lg bg-gold-500/15 px-5 py-4 text-sm leading-loose text-gold-300"
            >
              {state.messageAr}
            </p>
          ) : (
            <form action={action} className="mt-7 space-y-3">
              <input type="hidden" name="courseId" value={courseId ?? ''} />

              <label htmlFor="lc-name" className="sr-only">
                الاسم
              </label>
              <input
                id="lc-name"
                name="name"
                required
                maxLength={120}
                placeholder="الاسم"
                className={field}
              />

              <label htmlFor="lc-email" className="sr-only">
                البريد الإلكتروني
              </label>
              <input
                id="lc-email"
                name="email"
                type="email"
                required
                dir="rtl"
                onInput={latinAwareDir}
                placeholder="البريد الإلكتروني"
                className={field}
              />

              <label htmlFor="lc-phone" className="sr-only">
                رقم الواتساب
              </label>
              <input
                id="lc-phone"
                name="phone"
                type="tel"
                dir="rtl"
                onInput={latinAwareDir}
                inputMode="numeric"
                placeholder="رقم الواتساب (اختياري)"
                className={field}
              />

              <Submit />

              {state && !state.ok && (
                <p role="status" className={cn('text-sm text-red-300')}>
                  {state.messageAr}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
