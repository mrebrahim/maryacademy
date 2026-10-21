import 'server-only'

import { createHash } from 'node:crypto'

/**
 * Server-side purchase reporting: Meta Conversions API, GA4 Measurement
 * Protocol, TikTok Events API.
 *
 * This exists because the browser must never report a purchase. A
 * client-side purchase event can be replayed by anyone who opens the
 * success page, and it fires when somebody *says* they transferred, not
 * when the money arrives — so the number the ad spend is judged on would
 * be inflated by exactly the people who did not pay. InstaPay and
 * Vodafone Cash have no webhook, so the one honest signal is an admin
 * confirming the transfer, and that is where this is called from.
 *
 * Everything here is fire-and-forget and nothing throws. A rejected token
 * or a blocked outbound request must never stop an order being confirmed
 * — the student's access matters more than the attribution.
 *
 * Tokens are server-only, with no NEXT_PUBLIC_ prefix, so they cannot
 * reach the browser bundle. A Conversions API token posted to a browser
 * lets a stranger write events into the ad account.
 */

const META_PIXEL_ID = process.env.FB_PIXEL_ID ?? process.env.NEXT_PUBLIC_FB_PIXEL_ID
const META_TOKEN = process.env.FB_CONVERSIONS_API_TOKEN

/**
 * Set this ONLY while watching the Test Events tab, and unset it the
 * moment the test passes.
 *
 * Meta treats any event carrying a test code as a test: it shows up in
 * Test Events and is excluded from everything real — reporting,
 * optimisation, attribution. Left in place, every confirmed sale would
 * vanish from the ad account while appearing to work perfectly, which is
 * the worst kind of broken because nothing errors.
 */
const META_TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE

const GA4_ID = process.env.GA4_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA4_ID
const GA4_SECRET = process.env.GA4_API_SECRET

const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID ?? process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
const TIKTOK_TOKEN = process.env.TIKTOK_ACCESS_TOKEN

export type PurchaseEvent = {
  orderId: string
  /** Pounds, not piastres. */
  value: number
  email?: string | null
  phone?: string | null
  courseSlug?: string | null
}

/** Every platform wants identifiers hashed, lowercased and trimmed. */
function hash(value: string | null | undefined) {
  const clean = value?.trim().toLowerCase()
  if (!clean) return undefined
  return createHash('sha256').update(clean).digest('hex')
}

/**
 * Egyptian numbers are stored as 01xxxxxxxxx. The ad platforms match on
 * E.164 without the plus, so a local number has to become 20xxxxxxxxxx or
 * it matches nobody and the event is counted but attributed to no one.
 */
function normalisePhone(phone: string | null | undefined) {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  if (!digits) return undefined
  if (digits.startsWith('0') && digits.length === 11) return `2${digits}`
  return digits
}

async function post(label: string, url: string, body: unknown) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      // The caller is an admin waiting on a button; none of this is worth
      // holding that up.
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) {
      console.error(`[conversions] ${label} ${response.status}`, await response.text())
    }
  } catch (error) {
    console.error(`[conversions] ${label}`, error)
  }
}

/**
 * Reports one confirmed purchase to whichever platforms are configured.
 *
 * `event_id` is the order id everywhere. That is what lets Meta discard a
 * duplicate if a browser-side Purchase is ever added later — without it,
 * running both would double every sale.
 */
export async function reportPurchase(event: PurchaseEvent) {
  const timestamp = Math.floor(Date.now() / 1000)
  const emailHash = hash(event.email)
  const phoneHash = hash(normalisePhone(event.phone))

  const jobs: Promise<void>[] = []

  if (META_PIXEL_ID && META_TOKEN) {
    jobs.push(
      post(
        'meta',
        `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_TOKEN}`,
        {
          test_event_code: META_TEST_EVENT_CODE || undefined,
          data: [
            {
              event_name: 'Purchase',
              event_time: timestamp,
              event_id: event.orderId,
              action_source: 'system_generated',
              user_data: {
                em: emailHash ? [emailHash] : undefined,
                ph: phoneHash ? [phoneHash] : undefined,
              },
              custom_data: {
                currency: 'EGP',
                value: event.value,
                content_name: event.courseSlug ?? undefined,
              },
            },
          ],
        },
      ),
    )
  }

  if (GA4_ID && GA4_SECRET) {
    jobs.push(
      post(
        'ga4',
        `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_ID}&api_secret=${GA4_SECRET}`,
        {
          // No browser involved, so there is no real client id. The order
          // id keeps the event attached to one consistent pseudo-user
          // rather than inventing a new visitor per sale.
          client_id: event.orderId,
          non_personalized_ads: false,
          events: [
            {
              name: 'purchase',
              params: {
                transaction_id: event.orderId,
                currency: 'EGP',
                value: event.value,
                items: event.courseSlug
                  ? [{ item_id: event.courseSlug, price: event.value, quantity: 1 }]
                  : undefined,
              },
            },
          ],
        },
      ),
    )
  }

  if (TIKTOK_PIXEL_ID && TIKTOK_TOKEN) {
    jobs.push(
      (async () => {
        try {
          const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'Access-Token': TIKTOK_TOKEN,
            },
            body: JSON.stringify({
              event_source: 'web',
              event_source_id: TIKTOK_PIXEL_ID,
              data: [
                {
                  event: 'CompletePayment',
                  event_time: timestamp,
                  event_id: event.orderId,
                  user: { email: emailHash, phone: phoneHash },
                  properties: {
                    currency: 'EGP',
                    value: event.value,
                    contents: event.courseSlug
                      ? [{ content_id: event.courseSlug, quantity: 1, price: event.value }]
                      : undefined,
                  },
                },
              ],
            }),
            signal: AbortSignal.timeout(4000),
          })

          if (!response.ok) {
            console.error('[conversions] tiktok', response.status, await response.text())
          }
        } catch (error) {
          console.error('[conversions] tiktok', error)
        }
      })(),
    )
  }

  await Promise.allSettled(jobs)
}
