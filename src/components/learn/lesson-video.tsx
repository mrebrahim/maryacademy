import { Lock, Video } from 'lucide-react'

import type { PlaybackUrl } from '@/lib/bunny'

/**
 * The 16:9 frame at the top of a lesson.
 *
 * Four states, and each says something different — the difference between
 * "you cannot watch this" and "this is not uploaded yet" matters a great
 * deal to whoever is reading it.
 */
export function LessonVideo({
  playback,
  locked,
  title,
}: {
  playback: PlaybackUrl | null
  locked: boolean
  title: string
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-navy-950">
      {locked ? (
        <Frame icon={Lock} messageAr="الدرس ده متاح للمشتركين في الدورة" />
      ) : playback && 'embedUrl' in playback ? (
        <iframe
          src={playback.embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : playback?.unavailableReason === 'not_configured' ? (
        <Frame icon={Video} messageAr="مشغّل الفيديو لسه مش متظبط. كلّم الدعم." />
      ) : (
        <Frame icon={Video} messageAr="الفيديو بتاع الدرس ده لسه بيترفع" />
      )}
    </div>
  )
}

function Frame({
  icon: Icon,
  messageAr,
}: {
  icon: typeof Lock
  messageAr: string
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#C9A24B_0,#C9A24B_1px,transparent_1px,transparent_11px)]"
        aria-hidden="true"
      />
      <Icon className="relative size-10 text-gold-500/70" aria-hidden="true" />
      <p className="relative text-sm leading-relaxed text-cream-50/75">{messageAr}</p>
    </div>
  )
}
