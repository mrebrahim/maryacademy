import type { Metadata, Viewport } from 'next'

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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
