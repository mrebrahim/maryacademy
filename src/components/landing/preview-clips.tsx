import { SectionHeading } from '@/components/ui/section-heading'

/**
 * Clips from inside the course.
 *
 * Every other section on the page makes a claim about the teaching. This
 * one lets the visitor judge it. Nothing renders while the list is empty —
 * an empty "watch a lesson" block is worse than no block at all.
 */
export function PreviewClips({
  clips,
}: {
  clips: { videoId: string; titleAr: string }[]
}) {
  if (clips.length === 0) return null

  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID
  if (!libraryId) return null

  return (
    <section aria-labelledby="preview-clips" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          id="preview-clips"
          kicker="من جوه الكورس"
          title="شوف طريقة الشرح بنفسك"
          subtitle="دقايق من دروس حقيقية — مش إعلان."
          align="center"
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {clips.map((clip) => (
            <li key={clip.videoId}>
              <figure>
                <div className="relative aspect-video overflow-hidden rounded-card bg-navy-900 ring-1 ring-gold-500/20">
                  <iframe
                    src={`https://iframe.mediadelivery.net/embed/${libraryId}/${clip.videoId}?autoplay=false&preload=false`}
                    title={clip.titleAr}
                    loading="lazy"
                    allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-navy-900">{clip.titleAr}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
