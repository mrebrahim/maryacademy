'use client'

import { Check, Copy, ExternalLink } from 'lucide-react'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { applyCoupon, submitTransfer, type CouponState, type OrderState } from '@/app/actions/checkout'
import { Button } from '@/components/ui/button'
import { instapay } from '@/config/instapay'
import { formatPrice } from '@/lib/utils'

const field =
  'w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-500'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'لحظة…' : label}
    </Button>
  )
}

function CopyHandle() {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(instapay.handle)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm transition hover:border-gold-500"
    >
      <span dir="ltr" className="font-medium text-navy-900">
        {instapay.handle}
      </span>
      {copied ? (
        <Check className="size-4 text-gold-600" aria-hidden="true" />
      ) : (
        <Copy className="size-4 text-muted" aria-hidden="true" />
      )}
      <span className="sr-only">نسخ العنوان</span>
    </button>
  )
}

export function CheckoutForm({
  courseId,
  courseTitle,
  priceEgp,
  compareAtEgp,
}: {
  courseId: string
  courseTitle: string
  priceEgp: number
  compareAtEgp: number | null
}) {
  const [coupon, couponAction] = useActionState<CouponState, FormData>(applyCoupon, null)
  const [order, orderAction] = useActionState<OrderState, FormData>(submitTransfer, null)

  const discount = coupon?.ok ? (coupon.discountAmount ?? 0) : 0
  const total = Math.max(0, priceEgp - discount)

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
      {/* ---- Summary ---- */}
      <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
        <h2 className="text-lg text-navy-900">ملخص الطلب</h2>

        <p className="mt-4 text-sm text-muted">{courseTitle}</p>

        <dl className="mt-5 space-y-2 border-t border-navy-900/10 pt-5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted">سعر الدورة</dt>
            <dd className="tabular text-navy-900">{formatPrice(priceEgp)}</dd>
          </div>

          {compareAtEgp && compareAtEgp > priceEgp && (
            <div className="flex items-center justify-between text-muted">
              <dt>السعر قبل الخصم</dt>
              <dd className="tabular line-through">{formatPrice(compareAtEgp)}</dd>
            </div>
          )}

          {discount > 0 && (
            <div className="flex items-center justify-between text-gold-600">
              <dt>خصم الكود {coupon?.code}</dt>
              <dd className="tabular">− {formatPrice(discount)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex items-baseline justify-between border-t border-navy-900/10 pt-5">
          <span className="font-semibold text-navy-900">الإجمالي</span>
          <span className="tabular font-display text-2xl text-gold-600">{formatPrice(total)}</span>
        </div>

        {/* Coupon — validated server-side; the discount here is display only,
            the database recomputes it when the order is created. */}
        <form action={couponAction} className="mt-6 flex gap-2">
          <input type="hidden" name="courseId" value={courseId} />
          <label htmlFor="code" className="sr-only">
            كود الخصم
          </label>
          <input id="code" name="code" placeholder="كود الخصم" className={field} />
          <Button type="submit" variant="tertiary" size="md" className="shrink-0">
            تطبيق
          </Button>
        </form>

        {coupon && (
          <p
            role="status"
            className={`mt-3 text-sm ${coupon.ok ? 'text-gold-600' : 'text-red-600'}`}
          >
            {coupon.messageAr}
          </p>
        )}
      </div>

      {/* ---- Payment ---- */}
      <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5">
        <h2 className="text-lg text-navy-900">الدفع عن طريق إنستا باي</h2>

        <ol className="mt-5 space-y-5 text-sm">
          <li>
            <p className="font-semibold text-navy-900">
              <span className="tabular">1</span>. حوّل المبلغ
            </p>
            <p className="mt-2 leading-loose text-muted">
              حوّل <span className="tabular font-semibold text-navy-900">{formatPrice(total)}</span>{' '}
              على العنوان ده
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CopyHandle />
              <a
                href={instapay.payLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gold-600 underline underline-offset-4 hover:text-gold-500"
              >
                افتح إنستا باي
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-2 text-xs text-muted">باسم: {instapay.name}</p>
          </li>

          <li>
            <p className="font-semibold text-navy-900">
              <span className="tabular">2</span>. اكتب رقم العملية
            </p>
            <p className="mt-2 leading-loose text-muted">
              بعد التحويل هيظهرلك رقم أو مرجع للعملية — اكتبه هنا عشان نقدر نطابقه.
            </p>
          </li>
        </ol>

        <form action={orderAction} className="mt-6 space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="couponCode" value={coupon?.ok ? (coupon.code ?? '') : ''} />

          <div>
            <label htmlFor="reference" className="mb-1.5 block text-sm font-semibold text-navy-900">
              رقم أو مرجع العملية
            </label>
            <input id="reference" name="reference" required dir="ltr" className={field} />
          </div>

          <SubmitButton label="أرسل بيانات التحويل" />

          {order && !order.ok && (
            <p role="status" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {order.messageAr}
            </p>
          )}
        </form>

        <p className="mt-5 text-xs leading-relaxed text-muted">
          بنراجع التحويل ونفعّل حسابك على الدورة. لو فيه أي تأخير، تواصل معانا على واتساب.
        </p>
      </div>
    </div>
  )
}
