'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { createCourse, type CurriculumState } from '@/app/actions/curriculum'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-gold-500'

function Save() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? 'لحظة…' : 'اعملي الدورة'}
    </Button>
  )
}

export function NewCourseForm({ categories }: { categories: { id: string; name_ar: string }[] }) {
  const [state, action] = useActionState<CurriculumState, FormData>(createCourse, null)
  const [slug, setSlug] = useState('')

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-900">اسم الدورة</span>
        <input name="titleAr" required className={cn(field, 'mt-1.5')} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-900">رابط الدورة</span>
        <input
          name="slug"
          required
          dir="ltr"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="makeup-master-class"
          className={cn(field, 'mt-1.5')}
        />
        {/* The slug is in every link to the course and cannot be changed
            later without breaking the ones already shared, so it is shown
            as the address it will become rather than as a code. */}
        <span dir="ltr" className="mt-1.5 block text-xs text-muted">
          /courses/{slug || '…'}
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-900">
          العنوان الفرعي <span className="font-normal text-muted">(اختياري)</span>
        </span>
        <input name="subtitleAr" className={cn(field, 'mt-1.5')} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-900">التصنيف</span>
        <select name="categoryId" defaultValue="" className={cn(field, 'mt-1.5')}>
          <option value="">— من غير تصنيف —</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name_ar}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-900">السعر للمصريين (جنيه)</span>
          <input
            name="priceEgp"
            type="number"
            min={0}
            step={50}
            dir="ltr"
            required
            defaultValue={0}
            className={cn(field, 'mt-1.5')}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-navy-900">لغير المصريين (جنيه)</span>
          <input
            name="priceEgpIntl"
            type="number"
            min={0}
            step={50}
            dir="ltr"
            placeholder="سيبيها فاضية"
            className={cn(field, 'mt-1.5')}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Save />
        {state && !state.ok && <p className="text-sm text-red-600">{state.messageAr}</p>}
      </div>
    </form>
  )
}
