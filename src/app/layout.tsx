import type { Metadata, Viewport } from 'next'

import { siteConfig } from '@/config/site'
import { amiri, cinzel, tajawal } from '@/lib/fonts'

import './globals.css'

import { Analytics } from '@/components/analytics'

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
  verification: {
    other: {
      // Meta domain verification. Not a secret — it is a public meta tag
      // whose only job is to prove this domain belongs to the business
      // account. Without it, iOS traffic loses most of its attribution
      // and nobody can configure which events this domain may send.
      'facebook-domain-verification': 'wajcny7b7n6iyeso7yijyqogarhgeq',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1B3D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${tajawal.variable} ${cinzel.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
