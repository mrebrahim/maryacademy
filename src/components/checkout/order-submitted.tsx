'use client'

import { useEffect, useRef } from 'react'

import { trackOrderSubmitted } from '@/lib/analytics'

/**
 * Fires `order_submitted` once, on the confirmation page.
 *
 * This is the event the ad campaigns optimise on. It has to be here
 * rather than on the button, because a click is not an order: the
 * database can still refuse one — already enrolled, course not priced,
 * not sold abroad — and an event fired before the server answered would
 * teach the campaign to find people whose orders fail.
 *
 * Guarded against React's development double-render and against a
 * refresh: the browser's history entry is marked once reported, so
 * reloading the page cannot report the same order twice. It is not
 * bulletproof — a new tab on the same URL would fire again — which is
 * another reason the money event lives on the server.
 */
export function OrderSubmitted({ orderId, value }: { orderId: string; value: number }) {
  const reported = useRef(false)

  useEffect(() => {
    if (reported.current) return
    reported.current = true

    const key = `order-reported:${orderId}`
    try {
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')
    } catch {
      // Private browsing blocks storage; reporting twice is better than
      // not reporting at all, so carry on.
    }

    trackOrderSubmitted({ orderId, value })
  }, [orderId, value])

  return null
}
