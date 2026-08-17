import type { Metadata, Viewport } from 'next'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { siteConfig } from '@/config/site'
import { amiri, cinzel, tajawal } from '@/lib/fonts'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.nameEn} | ${siteConfig.nameAr}`,
    template: `%s | ${siteConfig.nameAr}`,
  },
  description: siteConfig.descriptionAr,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.nameAr,
    title: siteConfig.nameAr,
    description: siteConfig.descriptionAr,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1B3D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${tajawal.variable} ${cinzel.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-100 focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-navy-900"
        >
          تخطي إلى المحتوى
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
