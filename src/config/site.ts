/**
 * Site-wide configuration.
 *
 * PRD §7.1 requires the homepage stats to come from a config file rather
 * than being hardcoded in JSX, and PRD §9.2 requires every social-proof
 * number to be labelled as in-person training — the academy has zero
 * online students. `context` below carries that label; do not drop it.
 */

export const siteConfig = {
  nameAr: 'أكاديمية ماري رجائي للتجميل',
  shortNameAr: 'ماري رجائي',
  taglineAr: 'تعلمي باحتراف وابدئي مستقبلك في عالم الجمال',
  descriptionAr:
    'أكاديمية تدريب أونلاين لتصفيف الشعر والمكياج والعناية بالبشرة، بخبرة أكتر من 5 سنين تدريب حضوري.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'ar_EG',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
} as const

export const whatsappLink = (messageAr = 'السلام عليكم، عايزة أعرف تفاصيل الكورسات') =>
  siteConfig.whatsappNumber
    ? `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(messageAr)}`
    : '/contact'

/**
 * Homepage stats bar. `context` is rendered under each figure so the
 * numbers are never mistaken for online-course results (PRD §7.1, §9.2).
 */
export const academyStats = [
  { value: '+400', labelAr: 'متدربة ومتدرب', contextAr: 'في التدريب الحضوري' },
  { value: '+40', labelAr: 'دورة تدريبية', contextAr: 'حضورية على مدار 5 سنين' },
  { value: '5', labelAr: 'سنوات خبرة', contextAr: 'في التدريب والتجميل' },
  { value: 'مصر', labelAr: 'جميع أنحاء مصر', contextAr: 'متدربات من كل المحافظات' },
] as const

export const mainNav = [
  { href: '/', labelAr: 'الرئيسية' },
  { href: '/courses', labelAr: 'الدورات' },
  { href: '/about', labelAr: 'عن الأكاديمية' },
  { href: '/testimonials', labelAr: 'آراء المتدربات' },
  { href: '/blog', labelAr: 'المدونة' },
  { href: '/contact', labelAr: 'تواصلي معنا' },
] as const

/**
 * No refund-policy page: the client has decided there are no refunds and
 * that the topic is not to appear on the site at all.
 */
export const legalNav = [
  { href: '/terms', labelAr: 'الشروط والأحكام' },
  { href: '/privacy', labelAr: 'سياسة الخصوصية' },
] as const
