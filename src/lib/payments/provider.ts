import 'server-only'

import { instapay, vodafoneCash } from '@/config/manual-payments'

/**
 * Payment providers.
 *
 * The UI never names a provider. It asks this module what is available and
 * renders whatever comes back, so adding a card processor later is a new
 * file here plus an entry in `providers` — no component changes.
 *
 * Two kinds exist, and the difference matters for what the UI may promise:
 *
 *   'redirect'  — the provider takes the payment and tells us the result.
 *                 Access can be granted automatically.
 *   'manual'    — the student transfers money themselves and submits a
 *                 reference. Nobody can confirm it but a human, so access
 *                 follows an admin's confirmation, not the click.
 *
 * InstaPay and Vodafone Cash are both 'manual' because neither has a
 * merchant checkout API at this size. That is a fact about the rails, not
 * a gap in this code, and it is why the checkout copy says the account
 * opens after review rather than promising instant access it cannot
 * deliver.
 */

export type PaymentKind = 'manual' | 'redirect'

export type PaymentMethod = {
  id: string
  kind: PaymentKind
  labelAr: string
  /** One line under the label — what actually happens if they pick this. */
  hintAr: string
  available: boolean
}

export type PaymentOrder = {
  orderId: string
  courseId: string
  /** Minor units (piastres), always read from the database. */
  amount: number
  currency: 'EGP'
}

export type PaymentResult =
  | { kind: 'manual'; instructionsAr: string; handle: string; payLink?: string }
  | { kind: 'redirect'; url: string }

export interface PaymentProvider {
  readonly id: string
  readonly method: PaymentMethod
  createPayment(order: PaymentOrder): Promise<PaymentResult>
}

/**
 * InstaPay — the live route. Settlement is confirmed by an admin against
 * the transfer screenshot the student sends on WhatsApp. Asking them to
 * copy a reference number out of the InstaPay app instead was a field
 * nobody could verify: a typo and a fabrication look identical, and the
 * screenshot is both easier to send and harder to get wrong.
 */
export const instaPayProvider: PaymentProvider = {
  id: 'instapay',
  method: {
    id: 'instapay',
    kind: 'manual',
    labelAr: 'إنستا باي',
    hintAr: 'تحوّل المبلغ وتبعت سكرين شوت على واتساب، ونفتحلك الدورة بعد المطابقة',
    available: true,
  },
  async createPayment() {
    return {
      kind: 'manual',
      instructionsAr: 'حوّل المبلغ على العنوان ده، وبعدها ابعت سكرين شوت التحويل على واتساب.',
      handle: instapay.handle,
      payLink: instapay.payLink,
    }
  },
}

/**
 * Vodafone Cash. Same shape as InstaPay — transfer, screenshot, review —
 * and the second route the academy asked for, because plenty of buyers
 * have a wallet and no bank app.
 */
export const vodafoneCashProvider: PaymentProvider = {
  id: 'vodafone_cash',
  method: {
    id: 'vodafone_cash',
    kind: 'manual',
    labelAr: 'فودافون كاش',
    hintAr: 'تحوّل على المحفظة وتبعت سكرين شوت على واتساب، ونفتحلك الدورة بعد المطابقة',
    available: true,
  },
  async createPayment() {
    return {
      kind: 'manual',
      instructionsAr: 'حوّل المبلغ على الرقم ده، وبعدها ابعت سكرين شوت التحويل على واتساب.',
      handle: vodafoneCash.number,
    }
  },
}

/**
 * Local development only. Returns a redirect straight to the success page
 * so the whole flow can be walked through without moving real money.
 * Refuses to be selected in production — a mock that ships is a free course.
 */
export const mockProvider: PaymentProvider = {
  id: 'mock',
  method: {
    id: 'mock',
    kind: 'redirect',
    labelAr: 'دفع تجريبي (تطوير)',
    hintAr: 'للتجربة المحلية فقط — مش بيحوّل فلوس',
    available: process.env.NODE_ENV !== 'production',
  },
  async createPayment(order) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('mock provider is not available in production')
    }
    return { kind: 'redirect', url: `/checkout/success?order=${order.orderId}&mock=1` }
  },
}

const providers: PaymentProvider[] = [instaPayProvider, vodafoneCashProvider, mockProvider]

export function availableMethods(): PaymentMethod[] {
  return providers.map((p) => p.method).filter((m) => m.available)
}

export function getProvider(id: string): PaymentProvider | null {
  const provider = providers.find((p) => p.id === id)
  if (!provider || !provider.method.available) return null
  return provider
}

/** The single entry point the actions use. */
export async function createPayment(
  providerId: string,
  order: PaymentOrder,
): Promise<PaymentResult> {
  const provider = getProvider(providerId)
  if (!provider) throw new Error(`unknown or unavailable payment provider: ${providerId}`)
  return provider.createPayment(order)
}
