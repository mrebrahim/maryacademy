import Link from 'next/link'

import { legalNav, mainNav, siteConfig } from '@/config/site'

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-cream-50/80">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-lg text-white">{siteConfig.nameAr}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">{siteConfig.descriptionAr}</p>
          </div>

          <nav aria-label="روابط الموقع">
            <p className="font-display text-base text-gold-500">روابط سريعة</p>
            <ul className="mt-4 space-y-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-gold-300">
                    {item.labelAr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="روابط قانونية">
            <p className="font-display text-base text-gold-500">معلومات قانونية</p>
            <ul className="mt-4 space-y-2 text-sm">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-gold-300">
                    {item.labelAr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm">
          <p>
            © <span className="tabular">{new Date().getFullYear()}</span> {siteConfig.nameAr} — كل
            الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
