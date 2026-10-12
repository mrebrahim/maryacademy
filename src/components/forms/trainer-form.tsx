'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { submitTrainerApplication, type TrainerState } from '@/app/actions/trainers'
import { Button } from '@/components/ui/button'
import { latinAwareDir } from '@/lib/rtl'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:px-10">
      {pending ? 'لحظة…' : 'ابعت طلبك'}
    </Button>
  )
}

export function TrainerForm() {
  const [state, action] = useActionState<TrainerState, FormData>(submitTrainerApplication, null)

  if (state?.ok) {
    return (
      <p
        role="status"
        className="rounded-card border border-gold-500/40 bg-gold-500/10 px-6 py-8 text-center leading-loose text-navy-900"
      >
        {state.messageAr}
      </p>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-navy-900">
            الاسم بالكامل
          </label>
          <input id="fullName" name="fullName" required maxLength={120} className={field} />
        </div>

        <div>
          <label htmlFor="specialityAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
            تخصصك
          </label>
          <input
            id="specialityAr"
            name="specialityAr"
            required
            maxLength={120}
            placeholder="مكياج · عناية بالبشرة · تسريحات…"
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-navy-900">
            رقم الواتساب
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            required
            maxLength={14}
            dir="ltr"
            placeholder="01XXXXXXXXX"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy-900">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            dir="rtl"
            onInput={latinAwareDir}
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="yearsExperience"
            className="mb-1.5 block text-sm font-semibold text-navy-900"
          >
            سنين الخبرة
          </label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            dir="ltr"
            className={field}
          />
        </div>

        <div>
          <label
            htmlFor="portfolioUrl"
            className="mb-1.5 block text-sm font-semibold text-navy-900"
          >
            لينك شغلك <span className="font-normal text-muted">(إنستجرام أو موقع)</span>
          </label>
          <input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            dir="ltr"
            placeholder="https://"
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="aboutAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
          احكيلنا عن نفسك وعن الكورس اللي ناوي تقدّمه
        </label>
        <textarea id="aboutAr" name="aboutAr" rows={4} maxLength={2000} className={field} />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Submit />
        {state && !state.ok && (
          <p role="status" className={cn('text-sm text-red-600')}>
            {state.messageAr}
          </p>
        )}
      </div>
    </form>
  )
}
