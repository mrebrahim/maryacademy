/**
 * Feature flags for things that are built in stages.
 *
 * The price is now set, which on its own would have flipped every buy
 * button from WhatsApp to /checkout — a route that does not exist yet. So
 * showing the price and taking the payment are two separate switches:
 * the price renders from the database as soon as it is set, and the CTA
 * only moves to checkout when the payment flow is actually live.
 */

/** Flip when /checkout is built and InstaPay settlement is wired. */
export const CHECKOUT_ENABLED = false

/** Flip when the enrolled area and the video player are ready. */
export const LEARN_ENABLED = false
