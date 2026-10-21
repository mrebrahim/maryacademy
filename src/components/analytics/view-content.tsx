'use client'

import { useEffect } from 'react'

import { trackViewContent } from '@/lib/analytics'

/**
 * Fires ViewContent once for a course page.
 *
 * It exists because the landing page had this and the ordinary course
 * page did not — so a visitor who arrived at /courses/<slug> from an ad,
 * read the whole thing and left produced exactly one Meta event:
 * PageView. Nothing to build an audience from, nothing to retarget, and
 * no way to tell a page that interests people from one that does not.
 *
 * Rendered rather than called inline so the page itself stays a server
 * component.
 */
export function ViewContentPing({ courseSlug }: { courseSlug: string }) {
  useEffect(() => {
    trackViewContent({ courseSlug })
  }, [courseSlug])

  return null
}
