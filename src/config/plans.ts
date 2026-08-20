/**
 * Subscription plans shown on /pricing.
 *
 * Prices are deliberately absent here. The per-course plan reads its figure
 * from the course row in the database, which is the only place a price is
 * allowed to live (a number copied into the front end drifts from the one
 * the checkout actually charges). A plan with no course attached shows
 * "تواصل معنا" until the academy sets a figure for it.
 *
 * Every CTA on this page goes to WhatsApp rather than checkout: the client
 * closes these sales in conversation, and the bundle has no price to charge
 * yet.
 */

export type Plan = {
  id: string
  nameAr: string
  /** Shown above the name, matching the card style used across the site. */
  nameEn: string
  taglineAr: string
  /** true → priced from the single published course in the database. */
  fromCourse: boolean
  featured: boolean
  featuresAr: readonly string[]
  ctaAr: string
  /** Prefilled WhatsApp message, so the team knows what was clicked. */
  whatsappMessageAr: string
}

export const plans: readonly Plan[] = [
  {
    id: 'single-course',
    nameEn: 'Single Course',
    nameAr: 'دورة واحدة',
    taglineAr: 'ادفع مرة واحدة، وادخل على الدورة اللي اخترتها بالكامل.',
    fromCourse: true,
    featured: true,
    featuresAr: [
      'كل دروس الدورة بالفيديو، بجودة عالية',
      'تتعلّم في وقتك، وتعيد أي درس زي ما تحب',
      'ملفات وموارد الدورة قابلة للتحميل',
      'شهادة إتمام باسمك بعد آخر درس',
      'مجتمع الدورة للأسئلة والنقاش',
      'دروس معاينة مفتوحة قبل ما تدفع',
    ],
    ctaAr: 'تواصل مع الفريق للحجز',
    whatsappMessageAr: 'أريد الاشتراك بالكورسات',
  },
  {
    id: 'academy',
    nameEn: 'Full Academy',
    nameAr: 'باقة الأكاديمية',
    taglineAr: 'كل دورات الأكاديمية المتاحة، وأي دورة جديدة تنزل.',
    fromCourse: false,
    featured: false,
    featuresAr: [
      'كل مميزات باقة الدورة الواحدة',
      'دخول على كل الدورات المتاحة في الأكاديمية',
      'الدورات الجديدة تتضاف لحسابك أول ما تنزل',
      'أولوية في الرد على الأسئلة',
      'شهادة إتمام لكل دورة تخلّصها',
    ],
    ctaAr: 'تواصل مع الفريق للحجز',
    whatsappMessageAr: 'أريد الاشتراك بالكورسات',
  },
] as const
