'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { createGroup, type CommunityState } from '@/app/actions/community'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

const AUDIENCES = [
  { value: 'enrolled', labelAr: 'للمشتركين', hintAr: 'اللي عندهم اشتراك فعّال في الدورات المختارة' },
  { value: 'not_enrolled', labelAr: 'لغير المشتركين', hintAr: 'اللي لسه ما اشتركوش — مساحة تعارف وتسويق' },
  { value: 'everyone', labelAr: 'للجميع', hintAr: 'أي حد مسجّل في المنصة' },
] as const

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? 'لحظة…' : 'إنشاء الجروب'}
    </Button>
  )
}

/**
 * Creating a group asks the two questions the academy actually needs
 * answered: which courses is it for (or is it general), and is it for
 * subscribers or for people who have not bought yet.
 */
export function GroupForm({ courses }: { courses: { id: string; title_ar: string }[] }) {
  const [state, action] = useActionState<CommunityState, FormData>(createGroup, null)
  const [scope, setScope] = useState<'general' | 'courses'>('courses')
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]['value']>('enrolled')

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nameAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
            اسم الجروب
          </label>
          <input id="nameAr" name="nameAr" required maxLength={120} className={field} />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-semibold text-navy-900">
            المعرّف في الرابط
          </label>
          <input
            id="slug"
            name="slug"
            required
            maxLength={60}
            dir="ltr"
            pattern="[a-z0-9\-]+"
            placeholder="hair-styling-students"
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="descriptionAr" className="mb-1.5 block text-sm font-semibold text-navy-900">
          وصف مختصر <span className="font-normal text-muted">(اختياري)</span>
        </label>
        <textarea id="descriptionAr" name="descriptionAr" rows={2} maxLength={1000} className={field} />
      </div>

      {/* ---- Question 1: which courses? ---- */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">
          الجروب ده لمشتركي أنهي دورات؟
        </legend>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'courses', labelAr: 'دورات محددة' },
              { value: 'general', labelAr: 'جروب عام' },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border px-4 py-2 text-sm transition',
                scope === option.value
                  ? 'border-gold-500 bg-gold-500/10 font-semibold text-navy-900'
                  : 'border-navy-900/15 text-muted hover:border-gold-500/50',
              )}
            >
              <input
                type="radio"
                name="scope"
                value={option.value}
                checked={scope === option.value}
                onChange={() => setScope(option.value)}
                className="sr-only"
              />
              {option.labelAr}
            </label>
          ))}
        </div>

        {scope === 'courses' && (
          <div className="mt-4 space-y-2 rounded-lg border border-navy-900/10 bg-cream-50 p-4">
            {courses.length === 0 ? (
              <p className="text-sm text-muted">مفيش دورات منشورة لحد دلوقتي.</p>
            ) : (
              courses.map((course) => (
                <label
                  key={course.id}
                  className="flex cursor-pointer items-center gap-3 text-sm text-navy-900"
                >
                  <input
                    type="checkbox"
                    name="courseIds"
                    value={course.id}
                    className="size-4 accent-[#C9A24B]"
                  />
                  {course.title_ar}
                </label>
              ))
            )}
          </div>
        )}
      </fieldset>

      {/* ---- Question 2: subscribers or not? ---- */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">
          الجروب للناس المشتركة ولا المش مشتركة؟
        </legend>

        <div className="grid gap-2 sm:grid-cols-3">
          {AUDIENCES.map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border p-3 text-sm transition',
                audience === option.value
                  ? 'border-gold-500 bg-gold-500/10 text-navy-900'
                  : 'border-navy-900/15 text-muted hover:border-gold-500/50',
              )}
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                checked={audience === option.value}
                onChange={() => setAudience(option.value)}
                className="sr-only"
              />
              <span className="block font-semibold">{option.labelAr}</span>
              <span className="mt-1 block text-xs leading-relaxed">{option.hintAr}</span>
            </label>
          ))}
        </div>
      </fieldset>

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
