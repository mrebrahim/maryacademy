import 'server-only'

import { createHash } from 'node:crypto'

/**
 * Bunny Stream playback.
 *
 * The browser gets an embed URL and nothing else — never the API key, and
 * never a direct CDN file URL, which would be a permanent public copy of
 * paid content for anyone who opened devtools.
 *
 * Token authentication is applied when BUNNY_TOKEN_AUTH_KEY is set. It is
 * a different value from the API key (Library → Security, not Library →
 * API); signing with the wrong one produces 403s that look like expiry.
 * Without it the embed still plays, but the link is not time-limited —
 * which is fine while the course is being built and not fine once it is
 * being sold.
 */

export type PlaybackUrl =
  | { embedUrl: string }
  | { unavailableReason: 'no_video' | 'not_configured' }

const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID
const TOKEN_KEY = process.env.BUNNY_TOKEN_AUTH_KEY

/** Four hours: long enough for a sitting, short enough that a copied URL dies. */
const TTL_SECONDS = 60 * 60 * 4

export function buildPlaybackUrl(videoId: string | null): PlaybackUrl {
  if (!videoId) return { unavailableReason: 'no_video' }
  if (!LIBRARY_ID) return { unavailableReason: 'not_configured' }

  const base = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`

  if (!TOKEN_KEY) {
    return { embedUrl: `${base}?autoplay=false&preload=false` }
  }

  const expires = Math.floor(Date.now() / 1000) + TTL_SECONDS
  // Bunny's embed token: sha256(key + videoId + expires), hex.
  const token = createHash('sha256').update(`${TOKEN_KEY}${videoId}${expires}`).digest('hex')

  return {
    embedUrl: `${base}?token=${token}&expires=${expires}&autoplay=false&preload=false`,
  }
}
