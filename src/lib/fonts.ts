import { Amiri, Cinzel, Tajawal } from 'next/font/google'

/**
 * Type pairing.
 *
 * Amiri is a naskh face with real calligraphic contrast — thick/thin strokes,
 * proper joins — so headlines read as typeset rather than rendered. Cairo and
 * Tajawal-Bold, the usual defaults, are uniform-weight geometric faces; at
 * display sizes they look like UI text scaled up, which is most of why the
 * first pass felt generic.
 *
 * Tajawal Light carries body copy: quiet enough that the Amiri headlines and
 * the gold do the talking.
 *
 * Cinzel matches the Latin serif in the academy's logo wordmark, so "Marie
 * Ragaie" set in running text belongs to the same family as the crest.
 */
export const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-latin',
  display: 'swap',
})
