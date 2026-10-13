'use client'

import { Check, Copy, ExternalLink, Lock, Tag } from 'lucide-react'
import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  applyCoupon,
  captureLead,
  submitTransfer,
  type CouponState,
  type OrderState,
} from '@/app/actions/checkout'
import { Button } from '@/components/ui/button'
import { instapay } from '@/config/instapay'
import { trackAbandonedLead, trackAddPaymentInfo, trackBeginCheckout } from '@/lib/analytics'
import { latinAwareDir } from '@/lib/rtl'
import { cn, formatPrice } from '@/lib/utils'

const field =
  'w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3.5 text-base text-ink outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'

const fieldError = 'border-red-400 focus:border-red-400 focus:ring-red-400/20'

/** Egyptian mobile numbers: 11 digits beginning 010/011/012/015. */
const EG_PHONE = /^01[0125]\d{8}$/

type Method = { id: string; kind: string; labelAr: string; hintAr: string }

function PayButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-navy-900/30 border-t-navy-900"
            aria-hidden="true"
          />
          لحظة…
        </>
      ) : (
        label
      )}
    </Button>
  )
}

function CopyHandle() {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(instapay.handle)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard is blocked in some in-app browsers; the handle is
          // selectable text either way, so this is not worth an error.
        }
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm transition hover:border-gold-500"
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
  included,
  methods,
  utm,
}: {
  courseId: string
  courseTitle: string
  priceEgp: number
  compareAtEgp: number | null
  included: string[]
  methods: Method[]
  utm: { source?: string; medium?: string; campaign?: string }
}) {
  const [coupon, couponAction] = useActionState<CouponState, FormData>(applyCoupon, null)
  const [order, orderAction] = useActionState<OrderState, FormData>(submitTransfer, null)

  const [showCoupon, setShowCoupon] = useState(false)
  const [method, setMethod] = useState(methods[0]?.id ?? 'instapay')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [values, setValues] = useState({ name: '', phone: '', email: '' })

  const payRef = useRef<HTMLDivElement | null>(null)
  const [payVisible, setPayVisible] = useState(false)
  const ids = useId()

  const discount = coupon?.ok ? (coupon.discountAmount ?? 0) : 0
  const total = Math.max(0, priceEgp - discount)
  const saving = compareAtEgp && compareAtEgp > priceEgp ? compareAtEgp - priceEgp : 0

  const phoneValid = EG_PHONE.test(values.phone.replace(/\s/g, ''))
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)

  useEffect(() => {
    trackBeginCheckout({ courseId, value: priceEgp / 100 })
  }, [courseId, priceEgp])

  // The sticky bar is a duplicate of the real button, so it hides once the
  // real one is on screen — two identical buttons at once reads as a bug.
  useEffect(() => {
    const node = payRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setPayVisible(entry.isIntersecting), {
      rootMargin: '-80px 0px 0px 0px',
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /**
   * Saves whatever has been typed so far. Fires on blur, so it runs on
   * partial input and often — which is the point: the person who fills in
   * an email and leaves is the one worth recovering.
   */
  function saveLead(next: typeof values) {
    if (!next.email && !next.phone) return
    const data = new FormData()
    data.set('courseId', courseId)
    data.set('name', next.name)
    data.set('phone', next.phone)
    data.set('email', next.email)
    if (utm.source) data.set('utmSource', utm.source)
    if (utm.medium) data.set('utmMedium', utm.medium)
    if (utm.campaign) data.set('utmCampaign', utm.campaign)
    void captureLead(data)
    trackAbandonedLead({ courseId })
  }

  function onBlur(key: keyof typeof values) {
    setTouched((t) => ({ ...t, [key]: true }))
    saveLead(values)
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
        {/* ================= Left: the form ================= */}
        <div className="order-2 space-y-6 lg:order-1">
          {/* ---- Your details ---- */}
          <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
            <h2 className="text-lg text-navy-900">بياناتك</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor={`${ids}-name`}
                  className="mb-1.5 block text-sm font-semibold text-navy-900"
                >
                  الاسم بالكامل
                </label>
                <input
                  id={`${ids}-name`}
                  name="name"
                  form={`${ids}-pay`}
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  onBlur={() => onBlur('name')}
                  className={field}
                />
              </div>

              <div>
                <label
                  htmlFor={`${ids}-phone`}
                  className="mb-1.5 block text-sm font-semibold text-navy-900"
                >
                  رقم الواتساب
                </label>
                <input
                  id={`${ids}-phone`}
                  name="phone"
                  form={`${ids}-pay`}
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={14}
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="01XXXXXXXXX"
                  value={values.phone}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, phone: e.target.value.replace(/[^\d\s]/g, '') }))
                  }
                  onBlur={() => onBlur('phone')}
                  aria-invalid={touched.phone && !phoneValid ? true : undefined}
                  className={cn(field, touched.phone && !phoneValid && fieldError)}
                />
                {touched.phone && !phoneValid && (
                  <p className="mt-1.5 text-sm text-red-600">
                    اكتب رقم موبايل مصري صحيح — ١١ رقم يبدأ بـ 010 أو 011 أو 012 أو 015
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${ids}-email`}
                  className="mb-1.5 block text-sm font-semibold text-navy-900"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id={`${ids}-email`}
                  name="email"
                  form={`${ids}-pay`}
                  required
                  type="email"
                  autoComplete="email"
                  dir="rtl"
                  onInput={latinAwareDir}
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  onBlur={() => onBlur('email')}
                  aria-invalid={touched.email && !emailValid ? true : undefined}
                  className={cn(field, touched.email && !emailValid && fieldError)}
                />
                <p className="mt-1.5 text-sm text-muted">
                  هنا هيوصلك كود الدخول للدورة — اتأكد إنه مكتوب صح.
                </p>
                {touched.email && !emailValid && (
                  <p className="mt-1 text-sm text-red-600">البريد مكتوب غلط</p>
                )}
              </div>
            </div>
          </section>

          {/* ---- Payment method ---- */}
          <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
            <h2 className="text-lg text-navy-900">طريقة الدفع</h2>

            <div className="mt-5 space-y-3">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition',
                    method === m.id
                      ? 'border-gold-500 bg-gold-500/8'
                      : 'border-navy-900/12 hover:border-gold-500/50',
                  )}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => {
                      setMethod(m.id)
                      trackAddPaymentInfo({ courseId, method: m.id, value: total / 100 })
                    }}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2',
                      method === m.id ? 'border-gold-500' : 'border-navy-900/25',
                    )}
                    aria-hidden="true"
                  >
                    {method === m.id && <span className="size-2.5 rounded-full bg-gold-500" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy-900">{m.labelAr}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                      {m.hintAr}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {/* ---- InstaPay instructions ---- */}
            {method === 'instapay' && (
              <div className="mt-5 rounded-xl bg-cream-50 p-4">
                <p className="text-sm leading-relaxed text-navy-900">
                  حوّل{' '}
                  <span className="tabular font-semibold">{formatPrice(total)}</span> على العنوان ده:
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <CopyHandle />
                  <a
                    href={instapay.payLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gold-600 underline underline-offset-4"
                  >
                    افتح إنستا باي
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-2 text-xs text-muted">باسم: {instapay.name}</p>
              </div>
            )}
          </section>

          {/* ---- Reference + pay ---- */}
          <section
            ref={payRef}
            className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6"
          >
            <form id={`${ids}-pay`} action={orderAction} className="space-y-4">
              <input type="hidden" name="courseId" value={courseId} />
              <input
                type="hidden"
                name="couponCode"
                value={coupon?.ok ? (coupon.code ?? '') : ''}
              />

              <div className="rounded-xl bg-cream-50 p-4">
                <p className="text-sm font-semibold text-navy-900">
                  بعد ما تحوّلي، ابعتيلنا سكرين شوت التحويل على واتساب
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  دوسي «أكمل الحجز» الأول، وهنوديكي على واتساب برسالة جاهزة — السكرين
                  شوت هو اللي بنطابق بيه التحويل ونفتحلك الدورة.
                </p>
              </div>

              <PayButton label="أكمل الحجز" />

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
                <Lock className="size-3.5" aria-hidden="true" />
                التحويل بيتم على تطبيق إنستا باي — مفيش بيانات بنكية بتتخزّن عندنا.
              </p>

              {order && !order.ok && (
                <p role="status" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {order.messageAr}
                </p>
              )}
            </form>
          </section>
        </div>

        {/* ================= Right: the summary ================= */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
          <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
            <h2 className="text-lg text-navy-900">{courseTitle}</h2>
            <p className="mt-1.5 text-sm text-muted">
              أونلاين — تتفرّج في أي وقت من أي محافظة
            </p>

            <div className="mt-5 border-t border-navy-900/10 pt-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-navy-900">الإجمالي</span>
                <span className="flex items-baseline gap-2">
                  {compareAtEgp && compareAtEgp > priceEgp && (
                    <span className="tabular text-sm text-muted line-through">
                      {formatPrice(compareAtEgp)}
                    </span>
                  )}
                  <span className="tabular font-display text-2xl text-gold-600">
                    {formatPrice(total)}
                  </span>
                </span>
              </div>

              {saving > 0 && discount === 0 && (
                <p className="tabular mt-2 text-sm font-semibold text-gold-600">
                  بتوفّر {formatPrice(saving)}
                </p>
              )}

              {discount > 0 && (
                <p className="tabular mt-2 text-sm font-semibold text-gold-600">
                  خصم الكود {coupon?.code} — {formatPrice(discount)}
                </p>
              )}
            </div>

            {included.length > 0 && (
              <ul className="mt-5 space-y-2.5 border-t border-navy-900/10 pt-5">
                {included.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-navy-900/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Coupon stays behind a link: an open field sends people off to
                hunt for a code they do not have, and some never come back. */}
            <div className="mt-5 border-t border-navy-900/10 pt-5">
              {showCoupon ? (
                <form action={couponAction} className="flex gap-2">
                  <input type="hidden" name="courseId" value={courseId} />
                  <label htmlFor={`${ids}-code`} className="sr-only">
                    كود الخصم
                  </label>
                  <input
                    id={`${ids}-code`}
                    name="code"
                    autoFocus
                    dir="ltr"
                    placeholder="كود الخصم"
                    className={field}
                  />
                  <Button type="submit" variant="tertiary" size="md" className="shrink-0">
                    تطبيق
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted underline underline-offset-4 transition hover:text-navy-900"
                >
                  <Tag className="size-3.5" aria-hidden="true" />
                  عندك كود خصم؟
                </button>
              )}

              {coupon && (
                <p
                  role="status"
                  className={cn('mt-3 text-sm', coupon.ok ? 'text-gold-600' : 'text-red-600')}
                >
                  {coupon.messageAr}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ================= Mobile sticky bar ================= */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-navy-900/10 bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-200 lg:hidden',
          payVisible ? 'translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">الإجمالي</span>
            <span className="tabular font-display text-lg leading-none text-gold-600">
              {formatPrice(total)}
            </span>
          </span>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={() => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          >
            أكمل الحجز
          </Button>
        </div>
      </div>

      {/* Keeps the last section clear of the fixed bar on mobile. */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
    </>
  )
}
