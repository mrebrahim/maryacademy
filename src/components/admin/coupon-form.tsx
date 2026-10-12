'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { createCoupon, type CouponAdminState } from '@/app/actions/coupons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? 'لحظة…' : 'إنشاء الكود'}
    </Button>
  )
}

export function CouponForm({ courses }: { courses: { id: string; title_ar: string }[] }) {
  const [state, action] = useActionState<CouponAdminState, FormData>(createCoupon, null)
  const [type, setType] = useState<'percent' | 'fixed'>('percent')

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-semibold text-navy-900">
            الكود
          </label>
          <input
            id="code"
            name="code"
            required
            dir="ltr"
            maxLength={40}
            placeholder="LAUNCH20"
            className={`${field} uppercase`}
          />
          <p className="mt-1.5 text-xs text-muted">حروف إنجليزية وأرقام وشرطات.</p>
        </div>

        <div>
          <label htmlFor="value" className="mb-1.5 block text-sm font-semibold text-navy-900">
            {type === 'percent' ? 'نسبة الخصم (%)' : 'قيمة الخصم (جنيه)'}
          </label>
          <input
            id="value"
            name="value"
            type="number"
            required
            min={1}
            step={type === 'percent' ? 1 : 50}
            dir="ltr"
            className={field}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">نوع الخصم</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'percent', labelAr: 'نسبة مئوية' },
              { value: 'fixed', labelAr: 'مبلغ ثابت' },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border px-4 py-2 text-sm transition',
                type === option.value
                  ? 'border-gold-500 bg-gold-500/10 font-semibold text-navy-900'
                  : 'border-navy-900/15 text-muted hover:border-gold-500/50',
              )}
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value)}
                className="sr-only"
              />
              {option.labelAr}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="courseId" className="mb-1.5 block text-sm font-semibold text-navy-900">
            الدورة
          </label>
          <select id="courseId" name="courseId" className={field} defaultValue="">
            <option value="">كل الدورات</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title_ar}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="maxRedemptions"
            className="mb-1.5 block text-sm font-semibold text-navy-900"
          >
            حد الاستخدام
          </label>
          <input
            id="maxRedemptions"
            name="maxRedemptions"
            type="number"
            min={1}
            dir="ltr"
            placeholder="بلا حد"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="expiresAt" className="mb-1.5 block text-sm font-semibold text-navy-900">
            ينتهي في
          </label>
          <input id="expiresAt" name="expiresAt" type="date" dir="ltr" className={field} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Submit />
        {state && (
          <p role="status" className={cn('text-sm', state.ok ? 'text-gold-600' : 'text-red-600')}>
            {state.messageAr}
          </p>
        )}
      </div>
    </form>
  )
}
