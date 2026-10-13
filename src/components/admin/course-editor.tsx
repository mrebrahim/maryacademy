'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateCourse, type ContentState } from '@/app/actions/content'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

type Course = {
  id: string
  title_ar: string
  subtitle_ar: string | null
  description_ar: string | null
  price_egp: number
  price_egp_intl: number
  compare_at_price_egp: number | null
  status: 'draft' | 'published' | 'archived'
  certificate_enabled: boolean
}

const STATUSES = [
  { value: 'draft', labelAr: 'مسودّة', hintAr: 'مش ظاهرة للناس' },
  { value: 'published', labelAr: 'منشورة', hintAr: 'ظاهرة ومتاحة للحجز' },
  { value: 'archived', labelAr: 'مؤرشفة', hintAr: 'اتشالت من الموقع' },
] as const

function Save() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? 'لحظة…' : 'احفظ التعديلات'}
    </Button>
  )
}

export function CourseEditor({ course }: { course: Course }) {
  const [state, action] = useActionState<ContentState, FormData>(updateCourse, null)
  const [status, setStatus] = useState(course.status)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={course.id} />

      <div>
        <label htmlFor="titleAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
          اسم الدورة
        </label>
        <input
          id="titleAr"
          name="titleAr"
          required
          maxLength={200}
          defaultValue={course.title_ar}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="subtitleAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
          السطر التعريفي
        </label>
        <input
          id="subtitleAr"
          name="subtitleAr"
          maxLength={300}
          defaultValue={course.subtitle_ar ?? ''}
          className={field}
        />
      </div>

      <div>
        <label
          htmlFor="descriptionAr"
          className="mb-1.5 block text-sm font-semibold text-navy-900"
        >
          الوصف
        </label>
        <textarea
          id="descriptionAr"
          name="descriptionAr"
          rows={3}
          maxLength={4000}
          defaultValue={course.description_ar ?? ''}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priceEgp" className="mb-1.5 block text-sm font-semibold text-navy-900">
            السعر (جنيه)
          </label>
          <input
            id="priceEgp"
            name="priceEgp"
            type="number"
            min={0}
            step={50}
            dir="ltr"
            required
            defaultValue={course.price_egp / 100}
            className={field}
          />
        </div>

        <div>
          <label
            htmlFor="priceEgpIntl"
            className="mb-1.5 block text-sm font-semibold text-navy-900"
          >
            السعر لغير المصريين <span className="font-normal text-muted">(بالجنيه)</span>
          </label>
          <input
            id="priceEgpIntl"
            name="priceEgpIntl"
            type="number"
            min={0}
            step={50}
            dir="ltr"
            defaultValue={course.price_egp_intl ? course.price_egp_intl / 100 : ''}
            className={field}
          />
          <p className="mt-1.5 text-xs text-muted">
            سيبيها فاضية لو الدورة مش بتتباع برّه مصر.
          </p>
        </div>

        <div>
          <label
            htmlFor="compareAtEgp"
            className="mb-1.5 block text-sm font-semibold text-navy-900"
          >
            السعر قبل الخصم <span className="font-normal text-muted">(اختياري)</span>
          </label>
          <input
            id="compareAtEgp"
            name="compareAtEgp"
            type="number"
            min={0}
            step={50}
            dir="ltr"
            defaultValue={course.compare_at_price_egp ? course.compare_at_price_egp / 100 : ''}
            className={field}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">حالة الدورة</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {STATUSES.map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border p-3 text-sm transition',
                status === option.value
                  ? 'border-gold-500 bg-gold-500/10 text-navy-900'
                  : 'border-navy-900/15 text-muted hover:border-gold-500/50',
              )}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={() => setStatus(option.value)}
                className="sr-only"
              />
              <span className="block font-semibold">{option.labelAr}</span>
              <span className="mt-0.5 block text-xs">{option.hintAr}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-navy-900">
        <input
          type="checkbox"
          name="certificateEnabled"
          value="on"
          defaultChecked={course.certificate_enabled}
          className="size-4 accent-[#C9A24B]"
        />
        شهادة إتمام للدورة دي
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Save />
        {state && (
          <p role="status" className={cn('text-sm', state.ok ? 'text-gold-600' : 'text-red-600')}>
            {state.messageAr}
          </p>
        )}
      </div>
    </form>
  )
}
