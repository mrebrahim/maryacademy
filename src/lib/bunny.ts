import 'server-only'

import { createHash } from 'node:crypto'

/**
 * Bunny Stream playback URLs.
 *
 * Token authentication means the embed URL is only valid for a signed window,
 * so a URL scraped out of the page stops working shortly after and cannot be
 * shared. The signature is SHA-256 over
 *   tokenAuthKey + videoId + expiryUnixSeconds
 * which is Bunny's documented scheme for embed URLs.
 *
 * This module imports `server-only`: the token key must never be bundled for
 * the browser, and the video id itself is not something a client is allowed
 * to see either (PRD §6.2).
 */

/** Four hours — long enough to watch a lesson, short enough that a leaked URL dies. */
const TOKEN_TTL_SECONDS = 4 * 60 * 60

export type PlaybackUrl = { embedUrl: string } | { unavailableReason: 'not_configured' | 'no_video' }

export function buildPlaybackUrl(videoId: string | null): PlaybackUrl {
  if (!videoId) return { unavailableReason: 'no_video' }

  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
  const tokenKey = process.env.BUNNY_TOKEN_AUTH_KEY

  // Without both, an embed URL would render a Bunny error page inside the
  // player, which reads as a broken lesson. Say it plainly instead.
  if (!libraryId || !tokenKey) return { unavailableReason: 'not_configured' }

  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const token = createHash('sha256').update(`${tokenKey}${videoId}${expires}`).digest('hex')

  const params = new URLSearchParams({
    token,
    expires: String(expires),
    autoplay: 'false',
    preload: 'true',
    // Bunny's player chrome follows the page language.
    captions: 'ar',
  })

  return {
    embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${params.toString()}`,
  }
}
