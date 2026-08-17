import Link from 'next/link'

import { Logo } from '@/components/ui/logo'
import { siteConfig } from '@/config/site'

/**
 * Landing-page shell for paid traffic.
 *
 * Deliberately without site navigation. A VSL page has one job and one exit
 * — the buy button. A header full of links to the blog and the about page
 * is a set of escape routes paid for by the ad spend, so the only thing at
 * the top is the logo, and the footer carries the legal minimum instead of
 * a sitemap.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4 sm:px-6">
          <Logo variant="mark" priority className="size-11" />
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="bg-navy-950 py-8 text-center text-xs text-cream-50/45">
        <p>
          © <span className="tabular">{new Date().getFullYear()}</span> {siteConfig.nameAr}
        </p>
        <p className="mt-2 flex justify-center gap-4">
          <Link href="/terms" className="hover:text-gold-300">
            الشروط والأحكام
          </Link>
          <Link href="/privacy" className="hover:text-gold-300">
            سياسة الخصوصية
          </Link>
        </p>
      </footer>
    </>
  )
}
