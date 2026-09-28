import type { Testimonial } from '@/lib/queries'

/**
 * The trainee testimonials, in the repository.
 *
 * These live in the database and are edited there — this file is the
 * fallback used only when that read comes back empty, which in practice
 * means Supabase was unreachable.
 *
 * It exists because social proof is the one thing on a sales page that
 * cannot be allowed to vanish. The testimonials section returns null when
 * it has no rows, so a database hiccup silently removed the most
 * persuasive part of the paid-traffic landing page and left no trace on
 * the page that anything was missing. Copy that never changes should not
 * depend on a network call.
 *
 * Kept byte-for-byte identical to supabase/seed.sql — same wording, same
 * emoji, same line breaks, same order. Each body holds one line per
 * original message, because these were separate DMs and stories; running
 * them together would read as edited marketing copy rather than as what
 * someone actually sent.
 *
 * PRD §9.2: every row is `in_person_training`, and the UI renders that
 * label under each name. The academy has zero online students, and the
 * page must not imply otherwise. The owner has confirmed publication
 * permission for all of them.
 *
 * If a testimonial is added, changed or removed in the database, mirror it
 * here — otherwise the two drift, and the drift only ever shows up during
 * an outage, which is the worst time to discover it.
 */
export const fallbackTestimonials: Testimonial[] = [
  {
    id: 'fallback-1',
    name: 'تينا',
    role_ar: 'هير ستايلست — التدريب الحضوري',
    body_ar:
      'نتيجة الكورس اللي أحب أشوفها 👌\nطبقت كل الكلام اللي قولتيه في الكورس ودي النتيجة ❤️',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-2',
    name: 'فيرو',
    role_ar: 'هير دريسر — التدريب الحضوري',
    body_ar:
      'حلاوة كورساتك لينا دي ❤️\nبجد يا ميري مش عارفة أشكرك إزاي، استفدت بطريقة متتخيلهاش. مكنتش بطلّع الفينش ده قبل كده خالص.\nبجد شكرًا ع كل معلومة ❤️\nكورس مع ميري يعني السيزون الجاي كله هيولّع الدنيا 😉',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-3',
    name: 'نانسي ألفونس',
    role_ar: 'هير ستايلست — ورشة القاهرة 2025',
    body_ar:
      'أول ما بدأت كنت بحلم إمتى آخد كورس مع ماري. حقيقي خطوة كان لازم تتاخد. استمتعت معاكي جدًا جدًا جدًا.\nماري من أشطر الناس مش بس في المجال ده، هي أستاذة في الشرح، بترد على اللي في دماغك من غير ما حد يسأل.\nبنصح أي حد سألني على كورس إنه لازم يروح كورس ماري، هي أكفأ حد يوصّل معلومة، مفيش أشطر منها، وهيستمتع بجد مش مجرد شغل.',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-4',
    name: 'هبة العشري',
    role_ar: 'مصممة طرح — التدريب الحضوري',
    body_ar:
      'أشطر واحدة وبجد استفدت منها كتير. وعندها ضمير في الشرح وعندها صبر رهيب، وبتقول كل حاجة ومش بتبخل بمعلومة ❤️\nأنا أول مرة من يوم ما بدأت من ٣ سنين آخد كورس، وبجد مش ندمانة خالص إني كنت معاكي ❤️',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-5',
    name: 'متدربة سابقة',
    role_ar: 'خريجة التدريب الحضوري',
    body_ar:
      'من أول ما اشتغلت وأنا أي مشكلة كانت بتحصل بكلّمها تظبط هي كل اللخبطة، من غير ما تعرفني ولا هي تكون مجبرة على ده. ممتنة ليها حقيقي ❤️',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-6',
    name: 'فاتن أيمن',
    role_ar: 'متدربة في التدريب الحضوري',
    body_ar:
      'لما قلت عايزة آخد كورس شعر والكل رشّحك — يا كتني تستاهلي إن الكل يختارك.\nمش خسارة فيكي الـ ١٢ ساعة طريق علشان أحضر معاكي. بحبك أوي ❤️',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-7',
    name: 'متدربة — مجموعة الكورس 15',
    role_ar: 'التدريب الحضوري — أغسطس 2024',
    body_ar:
      'تاني كورس أحضره مع ميري. حقيقي هي كانت السبب الأول بعد ربنا ليا في كل تطوراتي.\nومش معناه إني باخد معاها تاني إن دي قلة شرح ولا مستفدتش — بالعكس، ميري حد عنده ضمير أوي وصبووور جدًا.\nكل مرة بتعمل تكنيكس مختلفة وبستفاد جدًا. حقيقي كانوا أحلى وألذ ٣ أيام معاكي 😍',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-8',
    name: 'تهاني إميل',
    role_ar: 'دورة يونيو الحضورية',
    body_ar:
      'يا ماري شكرًا على تعبك ومجهودك وأمانتك معانا في كل معلومة بتقوليها لينا 🙏\nوإزاي بتخلّي عندنا طاقة وشغف وحماس إننا نيجي كل يوم ونقعد الوقت ده كله من غير ما نزهق أو نمل — بالعكس بجد بنبقى مبسوطين أوي ومش عايزين نمشي.\nبعيدًا عن الشغل، إنتي كشخصية حد لذيذ وخفيف ع القلب وبتحب تهزر — وده اللي بيخلي الكورس وقته لذيذ وكلنا متحمسين نيجي نشوفك.\nعقبال كل كورس، واحنا دايمًا بنتعلم منك ومن شطارتك.',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-9',
    name: 'سوزي طوبار',
    role_ar: 'مصممة طرح ومصففة — التدريب الحضوري',
    body_ar: 'حقيقي من أحلى الكورسات اللي حضرتها، وبجد استفدت جداا. شكرًا بجد على كل حاجة ❤️❤️',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-10',
    name: 'مارينا سمير',
    role_ar: 'التدريب الحضوري — القاهرة 2024',
    body_ar:
      'ماري شكرًا أوي بجد، الـ ٣ أيام فرقوا معايا أوي وحقيقي طلعت بتركات جديدة 🥹\nكفاية إني شفتك مرة تانية ✨ وشكرًا ع السشوار ده اللي بجد فرّحني 😂',
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
  {
    id: 'fallback-11',
    name: 'Ayaat Khalil',
    role_ar: 'Veil designer — in-person workshop',
    body_ar: "She's truly a professional hairdresser ✨ Her finishing is absolutely perfect!",
    rating: 5,
    avatar_url: null,
    source: 'in_person_training',
    video_id: null,
  },
]
