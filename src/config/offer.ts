/**
 * The offer, in one place.
 *
 * Every CTA on the landing page reads its destination from here, so the
 * page cannot end up with three buttons pointing at three different
 * things — which is what happens when a link is written inline in three
 * sections and only two get updated.
 *
 * The price is deliberately NOT here. It lives in the database
 * (`courses.price_egp`, in piastres) and is read per request, because a
 * price duplicated into the source is a price that will one day disagree
 * with the one checkout actually charges. PRD §6.1.
 */

export const offer = {
  courseSlug: 'hairstyling-master-class',
  /** Checkout is live — InstaPay transfer, then admin confirmation. */
  checkoutHref: '/checkout/hairstyling-master-class',
  courseHref: '/courses/hairstyling-master-class',
  ctaLabelAr: 'اشترك في الكورس دلوقتي',
  /**
   * The line under every CTA.
   *
   * It does not promise instant access, because InstaPay has no merchant
   * API: a human confirms the transfer, and access follows that. It does
   * not mention a refund either — the academy does not offer one and has
   * asked twice for refunds not to appear anywhere on the site.
   */
  ctaSubLabelAr: 'تحويل على إنستا باي · بنفتحلك الدورة بعد مطابقة التحويل',
} as const

/** Where a CTA sits on the page, for the cta_click event. */
export type CtaLocation = 'hero' | 'mid' | 'pricing' | 'sticky' | 'final'
