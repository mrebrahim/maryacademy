'use client'

/**
 * "Download" is the browser's own print-to-PDF.
 *
 * A PDF library would need Arabic font embedding and right-to-left
 * shaping to produce anything presentable, and would still look worse
 * than what Chrome already does with the page. This costs one client
 * component and no dependency.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
    >
      {label}
    </button>
  )
}
