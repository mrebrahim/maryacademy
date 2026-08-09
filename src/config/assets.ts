/**
 * Brand and marketing imagery.
 *
 * Until the real files exist the site draws designed placeholders, so nothing
 * renders as an empty box. Dropping the files into `public/` and flipping the
 * matching flag below is the whole swap — no layout changes needed.
 *
 * See public/brand/README.md for the exact filenames and sizes expected.
 */

/** Flip to true once public/brand/logo.png (or .svg) exists. */
export const HAS_LOGO_FILE = false

/** Flip to true once public/brand/hero.jpg exists. */
export const HAS_HERO_IMAGE = false

/** Flip to true once public/brand/instructor.jpg exists. */
export const HAS_INSTRUCTOR_IMAGE = false

export const brandAssets = {
  logo: '/brand/logo.png',
  logoMark: '/brand/logo-mark.png', // square crest only, for the header
  hero: '/brand/hero.jpg',
  instructor: '/brand/instructor.jpg',
} as const

/**
 * Course thumbnails, keyed by category slug. A category with no entry here
 * falls back to the patterned placeholder card.
 *
 * These can also come from the database (`courses.thumbnail_url`) once the
 * client uploads them to the `media` bucket in Supabase Storage — that path
 * wins over these static files.
 */
export const courseThumbnails: Partial<Record<string, string>> = {
  // 'hair-styling': '/courses/hair-styling.jpg',
  // 'hair-color':   '/courses/hair-color.jpg',
  // 'hair-cutting': '/courses/hair-cutting.jpg',
  // 'makeup':       '/courses/makeup.jpg',
  // 'skin-care':    '/courses/skin-care.jpg',
}
