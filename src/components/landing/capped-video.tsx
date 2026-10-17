'use client'

import { Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { offer } from '@/config/offer'

/**
 * A Bunny embed that stops after a set number of seconds.
 *
 * ⚠️ This shapes the experience; it does not protect the video. The whole
 * file still streams from the CDN, and the embed URL is in the page
 * source — open it in a new tab and the full lesson plays. Anyone who
 * wants the lesson can still have it. What this buys is the thing a
 * preview is actually for: the visitor watches two minutes, hits a wall,
 * and is asked to buy at the moment they were enjoying it.
 *
 * The only real fix is a separately uploaded clip, so that the long video
 * never leaves the server at all. That option is still open.
 *
 * Mechanism: Bunny's player speaks Player.js over postMessage. We ask it
 * to report `timeupdate`, and when it passes the cap we pause and cover
 * the frame. If the handshake never happens — a player version that does
 * not answer, a browser that blocks the message — nothing breaks: the
 * listener simply never fires and the video plays as a normal embed. That
 * is the right failure, because a preview that refuses to play is worse
 * than one that plays too much.
 */

type Message = { context?: string; event?: string; value?: { seconds?: number } }

export function CappedVideo({
  videoId,
  libraryId,
  title,
  maxSeconds,
}: {
  videoId: string
  libraryId: string
  title: string
  maxSeconds: number
}) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [reachedCap, setReachedCap] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const send = (method: string, value?: string) => {
      frame.contentWindow?.postMessage(
        JSON.stringify({ context: 'player.js', version: '0.0.11', method, value }),
        '*',
      )
    }

    // The player only starts reporting once it is listening, and it is not
    // listening until it has loaded — so ask on load, and once more on a
    // timer in case the load event fired before this effect ran.
    const subscribe = () => send('addEventListener', 'timeupdate')
    frame.addEventListener('load', subscribe)
    const retry = window.setTimeout(subscribe, 1200)

    function onMessage(event: MessageEvent) {
      if (event.source !== frame?.contentWindow) return

      let data: Message
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : (event.data as Message)
      } catch {
        return
      }

      if (data.context !== 'player.js' || data.event !== 'timeupdate') return

      const seconds = data.value?.seconds ?? 0
      if (seconds >= maxSeconds) {
        send('pause')
        // Wind back to the cap as well, so a viewer who dragged the
        // scrubber past it does not resume from deep inside the lesson.
        send('setCurrentTime', String(maxSeconds))
        setReachedCap(true)
      }
    }

    window.addEventListener('message', onMessage)

    return () => {
      frame.removeEventListener('load', subscribe)
      window.clearTimeout(retry)
      window.removeEventListener('message', onMessage)
    }
  }, [maxSeconds])

  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-navy-900 ring-1 ring-gold-500/20">
      <iframe
        ref={frameRef}
        src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=false`}
        title={title}
        loading="lazy"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />

      {reachedCap && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-navy-950/95 px-6 text-center">
          <Lock className="size-8 text-gold-500" aria-hidden="true" />
          <p className="text-base font-semibold text-white">
            كده شوفتي أول دقيقتين — باقي الدرس في الكورس
          </p>
          <Button asChild size="md">
            <a href={offer.checkoutHref}>{offer.ctaLabelAr}</a>
          </Button>
        </div>
      )}
    </div>
  )
}
