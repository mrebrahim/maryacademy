import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import { NewsletterForm } from '@/components/home/newsletter-form'
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/components/ui/social-icons'
import { legalNav, mainNav, siteConfig } from '@/config/site'

const COURSE_LINKS = [
  { href: '/courses/hairstyling-master-class', labelAr: 'Hair Styling' },
  { href: '/courses', labelAr: 'Hair Color' },
  { href: '/courses', labelAr: 'Hair Cutting' },
  { href: '/courses', labelAr: 'Makeup' },
  { href: '/courses', labelAr: 'Skin Care' },
] as const

// TODO: swap in the academy's real profile URLs once the client supplies them.
const SOCIALS = [
  { href: 'https://instagram.com/', label: 'إنستجرام', icon: InstagramIcon },
  { href: 'https://facebook.com/', label: 'فيسبوك', icon: FacebookIcon },
  { href: 'https://tiktok.com/', label: 'تيك توك', icon: TiktokIcon },
  { href: 'https://youtube.com/', label: 'يوتيوب', icon: YoutubeIcon },
] as const

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-cream-50/80">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter — PRD §7.1.6, writes to `leads` */}
          <div className="lg:order-1">
            <p className="font-display text-lg text-white">اشتركي في نشرتنا البريدية</p>
            <p className="mt-2 text-sm">للحصول على آخر العروض والدورات الجديدة</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>

          <div className="lg:order-2">
            <p className="font-display text-base text-gold-500">تواصلي معنا</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-gold-500" aria-hidden="true" />
                <span className="tabular" dir="ltr">
                  {siteConfig.whatsappNumber || '—'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-gold-500" aria-hidden="true" />
                <span dir="ltr">info@marieragaieacademy.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-gold-500" aria-hidden="true" />
                <span>مصر — جميع المحافظات</span>
              </li>
            </ul>
          </div>

          <nav aria-label="الدورات" className="lg:order-3">
            <p className="font-display text-base text-gold-500">الدورات</p>
            <ul className="mt-4 space-y-2 text-sm">
              {COURSE_LINKS.map((item) => (
                <li key={item.labelAr}>
                  <Link href={item.href} className="transition-colors hover:text-gold-300">
                    {item.labelAr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="روابط سريعة" className="lg:order-4">
            <p className="font-display text-base text-gold-500">روابط سريعة</p>
            <ul className="mt-4 space-y-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-gold-300">
                    {item.labelAr}
                  </Link>
                </li>
              ))}
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

        <div className="mt-12 flex flex-col items-center gap-5 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <p className="text-center text-sm sm:text-start">
            © <span className="tabular">{new Date().getFullYear()}</span> {siteConfig.nameAr} — كل
            الحقوق محفوظة.
          </p>

          <ul className="flex items-center gap-3">
            {SOCIALS.map((social) => {
              const Icon = social.icon
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid size-9 place-items-center rounded-full border border-gold-500/40 text-gold-500 transition hover:bg-gold-500 hover:text-navy-900"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </footer>
  )
}
