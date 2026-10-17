import localFont from 'next/font/local'

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
 *
 * ---
 *
 * These were `next/font/google` until a deploy failed on them. That loader
 * fetches the CSS and the files from Google at BUILD time, so the build
 * needs working egress to fonts.googleapis.com — and when the server
 * briefly did not have it, the loader got nothing back and threw
 * `Cannot read properties of null (reading '1')`, which says nothing about
 * fonts or the network. The same commit had built fine twenty minutes
 * earlier.
 *
 * The files are in the repository now (`src/fonts`, 316 KB, the same
 * subsets `next/font/google` was downloading: arabic for the two Arabic
 * faces, latin for Cinzel). Builds no longer touch the network, which on a
 * self-hosted server is the difference between a deploy that works and a
 * deploy that depends on somebody else's uptime.
 *
 * To change a weight: run `python3 scripts/fetch-fonts.py src/fonts`, then
 * list the new file below.
 */

export const amiri = localFont({
  src: [
    { path: '../fonts/amiri-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/amiri-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  // Arabic naskh has tall ascenders; the Latin fallback is only ever seen
  // for a moment, but matching it keeps headlines from jumping on load.
  fallback: ['Amiri', 'serif'],
})

export const tajawal = localFont({
  src: [
    { path: '../fonts/tajawal-300.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/tajawal-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/tajawal-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/tajawal-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['Tajawal', 'system-ui', 'sans-serif'],
})

export const cinzel = localFont({
  src: [
    { path: '../fonts/cinzel-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cinzel-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-latin',
  display: 'swap',
  fallback: ['Cinzel', 'serif'],
})
