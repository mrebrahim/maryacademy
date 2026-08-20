/**
 * Feature flags for things that are built in stages.
 *
 * The price is now set, which on its own would have flipped every buy
 * button from WhatsApp to /checkout — a route that does not exist yet. So
 * showing the price and taking the payment are two separate switches:
 * the price renders from the database as soon as it is set, and the CTA
 * only moves to checkout when the payment flow is actually live.
 */

/** Checkout is live: InstaPay transfer, then admin confirmation. */
export const CHECKOUT_ENABLED = true

/**
 * The player and progress tracking are live at /watch. Nothing reads this
 * flag any more — the player gates itself per lesson, on enrolment and on
 * the free-preview flag, which is a truer test than a global switch.
 */
export const LEARN_ENABLED = true
