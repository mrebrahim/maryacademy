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

/** How long to keep waiting for a tracker's script to arrive. */
const SDK_WAIT_MS = 8000
const SDK_POLL_MS = 250

/**
 * Runs `send` as soon as the tracker exists, rather than dropping the call
 * when it does not exist yet.
 *
 * This is not defensive padding — it is a bug fix. The pixels load with
 * `afterInteractive`, so they are fetched AFTER React hydrates. An event
 * fired from a mount effect on a small, fast page therefore ran while
 * `window.fbq` was still undefined, and `window.fbq?.(…)` threw nothing,
 * logged nothing and sent nothing. It looked exactly like working code.
 *
 * That is how `CompleteRegistration` went missing on the confirmation
 * page: the page is tiny, it hydrated before the pixel script landed, and
 * the one event the ad campaign is meant to optimise on was silently
 * discarded on every single order.
 *
 * Eight seconds is for a bad mobile connection in Egypt, which is most of
 * the traffic. After that the event is genuinely lost, and that is the
 * right place to stop — a tracker that has not loaded in eight seconds is
 * blocked, not slow.
 */
function whenAvailable(ready: () => boolean, send: () => void) {
  const attempt = () => {
    if (!ready()) return false
    try {
      send()
    } catch {
      // A tracker that throws must not take the page with it.
    }
    return true
  }

  if (attempt()) return

  let waited = 0
  const timer = window.setInterval(() => {
    waited += SDK_POLL_MS
    if (attempt() || waited >= SDK_WAIT_MS) window.clearInterval(timer)
  }, SDK_POLL_MS)
}

function emit({ ga4, meta, tiktok, params = {} }: Fanout) {
  if (typeof window === 'undefined') return

  // Cleaned once rather than per platform: an undefined in a pixel
  // payload shows up as the string "undefined" in some of their consoles.
  const clean: EventParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) clean[key] = value
  }

  // The dataLayer is a plain array and can be created here, so a GTM
  // container that loads later still replays it. No waiting needed.
  try {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event: ga4, ...clean })
  } catch {
    /* never take the page with it */
  }

  whenAvailable(
    () => typeof window.gtag === 'function',
    () => window.gtag?.('event', ga4, clean),
  )

  if (meta) {
    whenAvailable(
      () => typeof window.fbq === 'function',
      () => window.fbq?.('track', meta, clean),
    )
  }

  if (tiktok) {
    whenAvailable(
      () => typeof window.ttq?.track === 'function',
      () => window.ttq?.track(tiktok, clean),
    )
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

/**
 * The order is in: details submitted, amount known, transfer not yet
 * matched. This is the event ad campaigns should optimise on while the
 * pixel has no purchase history — it happens in the same session, it
 * happens often enough to learn from, and it is the last thing the buyer
 * does on the site.
 *
 * It is NOT a purchase, and it must never be named one. Roughly some
 * share of these never transfer, and an ad account told they all did will
 * spend against a number that was never real. `reportPurchase` fires
 * separately, server-side, when an admin confirms the money arrived.
 */
export function trackOrderSubmitted(params: { orderId: string; value: number }) {
  emit({
    ga4: 'order_submitted',
    meta: 'CompleteRegistration',
    tiktok: 'PlaceAnOrder',
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
