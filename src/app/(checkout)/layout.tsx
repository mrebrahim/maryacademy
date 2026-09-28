/**
 * The checkout group has no shell of its own — each page renders
 * CheckoutShell, which supplies the logo, the step bar and nothing else.
 *
 * It sits outside the (app) group deliberately: that group's header
 * carries links to the learning area, the community and the admin panel,
 * and a checkout page has no business offering someone three ways to
 * wander off mid-purchase.
 */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
