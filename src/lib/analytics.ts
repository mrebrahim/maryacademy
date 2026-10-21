/**
 * Analytics events for the funnel.
 *
 * One call per thing that happens, fanned out to every tracker that is
 * live — GA4, the Meta Pixel, the TikTok Pixel and the GTM dataLayer. The
 * fan-out lives here rather than at the call sites so that adding a
 * fourth tracker is one edit instead of fifteen, and so the three
 * platforms cannot drift into counting different events.
 *
 * Three rules, all from hard experience:
 *
 *   1. `purchase` is never fired from the browser. A client-side purchase
 *      event can be replayed by anyone who opens the success page, which
 *      inflates the number the ad spend is judged on. It fires server-side
 *      only, at the one moment money is actually confirmed — which for
 *      InstaPay is an admin confirming the transfer, since InstaPay has no
 *      webhook to listen to.
 *
 *   2. Nothing here throws. A blocked tracker, an ad-blocker, a missing
 *      container — none of that may break a checkout. Every call is
 *      wrapped and failures are swallowed.
 *
 *   3. Each platform gets the name it actually understands. Sending
 *      `begin_checkout` to Meta logs a custom event that no campaign can
 *      optimise for, which looks like tracking and is not.
 */

type EventParams = Record<string, string | number | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    ttq?: { page: () => void; track: (event: string, params?: EventParams) => void }
  }
}

/** The same moment, named three ways. A null means "not sent there". */
type Fanout = {
  /** GA4 event name, and the dataLayer event name for GTM. */
  ga4: string
  meta?: string | null
  tiktok?: string | null
  params?: EventParams
}

function emit({ ga4, meta, tiktok, params = {} }: Fanout) {
  if (typeof window === 'undefined') return

  // Cleaned once rather than per platform: an undefined in a pixel
  // payload shows up as the string "undefined" in some of their consoles.
  const clean: EventParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) clean[key] = value
  }

  try {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event: ga4, ...clean })
  } catch {
    /* never take the page with it */
  }

  try {
    window.gtag?.('event', ga4, clean)
  } catch {
    /* as above */
  }

  if (meta) {
    try {
      window.fbq?.('track', meta, clean)
    } catch {
      /* as above */
    }
  }

  if (tiktok) {
    try {
      window.ttq?.track(tiktok, clean)
    } catch {
      /* as above */
    }
  }
}

// ---------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------

/** `value` is in POUNDS, not piastres — the ad platforms report currency,
 *  and a figure a hundred times too small quietly ruins every ROAS number
 *  built on it. The callers convert; this does not convert again. */
export function trackBeginCheckout(params: { courseId: string; value: number }) {
  emit({
    ga4: 'begin_checkout',
    meta: 'InitiateCheckout',
    tiktok: 'InitiateCheckout',
    params: { ...params, currency: 'EGP' },
  })
}

/** `value` in pounds, as above. */
export function trackAddPaymentInfo(params: { courseId: string; method: string; value: number }) {
  emit({
    ga4: 'add_payment_info',
    meta: 'AddPaymentInfo',
    tiktok: 'AddPaymentInfo',
    params: { ...params, currency: 'EGP' },
  })
}

/** Fired when contact details are captured, before any payment attempt. */
export function trackAbandonedLead(params: { courseId: string }) {
  emit({ ga4: 'checkout_abandoned_lead', params })
}

// ---------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------

/** Fired once when the landing page loads. */
export function trackViewContent(params: { courseSlug: string }) {
  emit({ ga4: 'view_item', meta: 'ViewContent', tiktok: 'ViewContent', params })
}

/**
 * Scroll depth. The caller is responsible for firing each threshold once —
 * a scroll listener that re-fires makes the funnel unreadable.
 *
 * Google and Meta only: neither platform optimises on scroll, and TikTok
 * charges nothing for noise but reads worse for it.
 */
export function trackScrollDepth(depth: 50 | 90) {
  emit({ ga4: `scroll_${depth}`, params: { depth } })
}

/**
 * Which CTA is doing the work. `location` is the whole point: three
 * buttons with the same label tell you nothing about where people decide.
 */
export function trackCtaClick(params: { location: string; courseSlug: string }) {
  emit({ ga4: 'cta_click', tiktok: 'ClickButton', params })
}

export function trackGenerateLead(params: { courseSlug: string; source: string }) {
  emit({ ga4: 'generate_lead', meta: 'Lead', tiktok: 'SubmitForm', params })
}

export function trackWhatsappClick(params: { location: string }) {
  emit({ ga4: 'contact_whatsapp', meta: 'Contact', tiktok: 'Contact', params })
}
