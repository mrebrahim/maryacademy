/**
 * Public video embeds — promos, VSLs, clips.
 *
 * Deliberately separate from `src/lib/bunny.ts`, which imports
 * `server-only` and signs playback tokens for paid lessons. The
 * difference is not technical, it is what may be leaked: the videos here
 * are marketing, meant to be watched by anyone, so their ids may sit in
 * the page source. A lesson's `bunny_video_id` may not, and nothing in
 * this file should ever be handed one.
 *
 * The library id is public by design — it appears in every Bunny embed
 * URL — so `NEXT_PUBLIC_` is correct for it.
 */

export const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID

/** Null when there is no video, or when the player is not configured. */
export function promoEmbedUrl(videoId: string | null | undefined): string | null {
  if (!videoId || !BUNNY_LIBRARY_ID) return null
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&preload=false`
}
