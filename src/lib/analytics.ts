/**
 * Analytics events for the checkout funnel.
 *
 * Two rules, both from hard experience:
 *
 *   1. `purchase` is never fired from the browser. A client-side purchase
 *      event can be replayed by anyone who opens the success page, which
 *      inflates the number the ad spend is judged on. It fires server-side
 *      only, at the one moment money is actually confirmed — which for
 *      InstaPay is an admin confirming the transfer, since InstaPay has no
 *      webhook to listen to.
 *
 *   2. Nothing here throws. A blocked tracker, an ad-blocker, a missing
 *      GTM container — none of that may break a checkout. Every call is
 *      wrapped and failures are swallowed.
 */

type EventParams = Record<string, string | number | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
  }
}

function push(event: string, params: EventParams) {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event, ...params })
  } catch {
    // Analytics must never take the page with it.
  }
}

function fbq(event: string, params: EventParams) {
  if (typeof window === 'undefined') return
  try {
    window.fbq?.('track', event, params)
  } catch {
    // As above.
  }
}

export function trackBeginCheckout(params: { courseId: string; value: number }) {
  push('begin_checkout', { ...params, currency: 'EGP' })
  fbq('InitiateCheckout', { value: params.value, currency: 'EGP' })
}

export function trackAddPaymentInfo(params: { courseId: string; method: string; value: number }) {
  push('add_payment_info', { ...params, currency: 'EGP' })
  fbq('AddPaymentInfo', { value: params.value, currency: 'EGP' })
}

/** Fired when contact details are captured, before any payment attempt. */
export function trackAbandonedLead(params: { courseId: string }) {
  push('checkout_abandoned_lead', params)
}

// ---------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------

/** Fired once when the landing page loads. */
export function trackViewContent(params: { courseSlug: string }) {
  push('view_content', params)
  fbq('ViewContent', {})
}

/**
 * Scroll depth. The caller is responsible for firing each threshold once —
 * a scroll listener that re-fires makes the funnel unreadable.
 */
export function trackScrollDepth(depth: 50 | 90) {
  push(`scroll_${depth}`, { depth })
}

/**
 * Which CTA is doing the work. `location` is the whole point: three
 * buttons with the same label tell you nothing about where people decide.
 */
export function trackCtaClick(params: { location: string; courseSlug: string }) {
  push('cta_click', params)
}

export function trackGenerateLead(params: { courseSlug: string; source: string }) {
  push('generate_lead', params)
  fbq('Lead', {})
}

export function trackWhatsappClick(params: { location: string }) {
  push('contact_whatsapp', params)
}
