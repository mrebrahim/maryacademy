import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { mainNav, siteConfig, whatsappLink } from '@/config/site'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo variant="mark" priority className="size-11 shrink-0" />
          <span className="font-display text-base text-white sm:text-lg">
            {siteConfig.shortNameAr}
          </span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-cream-50/85 transition-colors hover:text-gold-300"
                >
                  {item.labelAr}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild size="sm">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              تواصل معنا
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
