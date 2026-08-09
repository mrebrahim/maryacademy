import { Almarai, Cairo } from 'next/font/google'

/**
 * PRD §3 — headings use a high-contrast Arabic display face, body uses
 * Cairo. Arabic subset only, `display: swap`, exposed as CSS variables so
 * globals.css and the Tailwind theme can both reach them.
 */
export const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['700', '800'],
  variable: '--font-almarai',
  display: 'swap',
})

export const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
})
