/**
 * Site-wide configuration.
 *
 * Voice: Modern Standard Arabic, addressing men and women alike. The first
 * pass was Egyptian colloquial in the feminine throughout ("تعلمي",
 * "اعملي") — that excluded half the audience and read informally for a
 * brand positioning itself as an academy. Calls to action use verbal nouns
 * (تصفّح، إنشاء، تسجيل) because those carry no gender at all.
 *
 * The one exception is testimonial text, which stays exactly as each
 * trainee wrote it. Those are real messages, not copy.
 *
 * PRD §7.1 requires the homepage stats to live here rather than in JSX, and
 * PRD §9.2 requires every social-proof figure to be labelled as in-person
 * training — the academy has no online graduates yet.
 */

export const siteConfig = {
  nameEn: 'Marie Ragaie Beauty Academy',
  nameAr: 'أكاديمية ماري رجائي للتجميل',
  shortNameAr: 'ماري رجائي',
  founderEn: 'Marie Ragaie',
  /** The academy is a collective under its founder, not one trainer. */
  positioningAr:
    'أكاديمية تجمع نخبة من المتخصصين في مختلف مجالات الجمال، تحت إشراف المؤسِّسة Marie Ragaie.',
  descriptionAr:
    'أكاديمية تدريب أونلاين في تصفيف الشعر والمكياج والعناية بالبشرة، بخبرة تتجاوز خمس سنوات من التدريب الحضوري.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'ar_EG',
  /**
   * The academy's WhatsApp number, in international form.
   *
   * Defaulted in code rather than left to the environment. It is public
   * information printed on every page, not a secret, and leaving it to a
   * variable meant every "talk to us" button on the live site silently
   * pointed at /contact instead — a dead end for someone who wanted to
   * buy. The env var still wins, so it can be changed without a deploy.
   */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201027555789',
} as const

export const whatsappLink = (messageAr = 'السلام عليكم، أرغب في معرفة تفاصيل الدورات') =>
  siteConfig.whatsappNumber
    ? `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(messageAr)}`
    : '/contact'

export const academyStats = [
  { value: '+400', labelAr: 'متدرب ومتدربة', contextAr: 'في التدريب الحضوري' },
  { value: '+40', labelAr: 'دورة تدريبية', contextAr: 'حضورية على مدار 5 سنوات' },
  { value: '5', labelAr: 'سنوات خبرة', contextAr: 'في التدريب والتجميل' },
  // A place, not a count — rendered without a figure.
  { value: null, labelAr: 'جميع محافظات مصر', contextAr: 'متدربون من مختلف المحافظات' },
] as const

export const mainNav = [
  { href: '/', labelAr: 'الرئيسية' },
  { href: '/courses', labelAr: 'الدورات' },
  { href: '/about', labelAr: 'عن الأكاديمية' },
  { href: '/testimonials', labelAr: 'آراء المتدربين' },
  { href: '/blog', labelAr: 'المدونة' },
  { href: '/contact', labelAr: 'تواصل معنا' },
] as const

/**
 * No refund-policy page: the client has decided there are no refunds and
 * that the topic is not to appear on the site at all.
 */
export const legalNav = [
  { href: '/terms', labelAr: 'الشروط والأحكام' },
  { href: '/privacy', labelAr: 'سياسة الخصوصية' },
] as const
