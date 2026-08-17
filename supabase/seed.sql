-- =====================================================================
-- Marie Ragaie Beauty Academy — seed
-- Idempotent: safe to re-run.
--
-- ⚠️ PLACEHOLDER CONTENT
--   * price_egp is 0 — the real price is PRD §13 open decision #1 and has
--     not been supplied. Checkout must refuse a course priced at 0.
--   * bunny_video_id is null on every lesson — PRD §13 open decision #6
--     (Bunny library) is unresolved and no videos have been uploaded.
--   * Lesson titles are a working curriculum for the 13 lessons / ~12h
--     described in the brief; the client should confirm or replace them.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Category
-- ---------------------------------------------------------------------
insert into public.categories (name_ar, slug, icon, sort_order) values
  ('تصفيف الشعر', 'hair-styling',  'scissors',  1),
  ('صبغات الشعر', 'hair-color',    'palette',   2),
  ('قص الشعر',    'hair-cutting',  'scissors',  3),
  ('مكياج',       'makeup',        'sparkles',  4),
  ('العناية بالبشرة', 'skin-care', 'droplet',   5)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Course: Hairstyling Master Class
-- ---------------------------------------------------------------------
insert into public.courses (
  title_ar, slug, subtitle_ar, description_ar, category_id, level,
  price_egp, compare_at_price_egp, status, published_at,
  certificate_enabled, sequential_unlock,
  what_you_learn, requirements, target_audience, pain_points, faq,
  seo_title, seo_description
)
select
  'دورة تصفيف الشعر الاحترافي',
  'hairstyling-master-class',
  'من الأساسيات إلى تسريحات العرائس — 13 درسًا عمليًا بالتفصيل',
  'برنامج عملي متكامل يبدأ من إمساك الفرشاة ويصل إلى تسليم تسريحة عروس كاملة بثقة.',
  c.id,
  'beginner',
  0,            -- ⚠️ placeholder, see header
  null,
  'published',
  now(),
  true,
  false,
  '["إتقان أساسيات السشوار والفرد والتموّج",
    "تنفيذ الضفائر بأنواعها بثبات لا يتفكك",
    "شينيون كلاسيكي ومودرن يثبت طوال اليوم",
    "تسريحات عرائس كاملة من البداية حتى الفينش",
    "تركيب الطرحة والإكسسوار باحتراف",
    "تسعير العمل، التعامل مع العميلة، وبناء بورتفوليو"]'::jsonb,
  '["لا تُشترط خبرة سابقة",
    "أدوات أساسية: فرشاة، سشوار، بيبي ليس، دبابيس، إسبراي تثبيت",
    "موديل أو رأس تدريب للتطبيق"]'::jsonb,
  '["من يبدأ في المجال من الصفر",
    "العاملون في الكوافير الراغبون في إتقان الفينش ورفع أسعارهم",
    "مصممو الطرح الراغبون في إضافة تسريحات الشعر لخدماتهم",
    "كل من تابع فيديوهات متفرقة لشهور دون الوصول إلى تنفيذ لوك كامل"]'::jsonb,
  -- Sales-page pain block. Specific to this course: the template renders
  -- whatever the course carries, so a makeup course gets its own.
  '["تتابع فيديوهات متفرقة منذ شهور، ولا تستطيع حتى الآن تنفيذ لوك كامل.",
    "تنفّذ التسريحة فتبدو جيدة، ثم تسقط بعد ساعتين.",
    "التحقت بدورة سابقة وشعرت أن نصف المعلومات لم يُقَل.",
    "أنهيت دورة، ثم لم تجد من يرد عليك حين واجهتك مشكلة.",
    "تعمل بالفعل، لكن لا تستطيع رفع سعرك لأن الفينش لا يقنعك."]'::jsonb,
  -- Refund terms and access duration are deliberately absent: the client
  -- asked for neither topic to appear anywhere on the site.
  '[{"q": "هل أحصل على شهادة؟",
     "a": "نعم، تصدر شهادة إتمام باسمك تلقائيًا بعد إنهاء جميع الدروس، وتحمل رقمًا يمكن التحقق منه عبر الموقع."},
    {"q": "ما طريقة الدفع؟",
     "a": "الدفع عبر إنستا باي، ويُفعَّل الحساب بعد التحويل."},
    {"q": "ما الأدوات المطلوبة؟",
     "a": "الأساسيات فقط: فرشاة، سشوار، بيبي ليس، دبابيس، وإسبراي تثبيت."},
    {"q": "هل الدورة مناسبة للمبتدئين تمامًا؟",
     "a": "نعم، تبدأ الدورة من الصفر وتتدرّج خطوة بخطوة حتى تسريحات العرائس."}]'::jsonb,
  'دورة تصفيف الشعر الاحترافي أونلاين | Marie Ragaie Beauty Academy',
  'تعلّم تصفيف الشعر من الأساسيات حتى تسريحات العرائس — 13 درسًا عمليًا، شهادة إتمام، ومتابعة مستمرة.'
from public.categories c
where c.slug = 'hair-styling'
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Modules
-- ---------------------------------------------------------------------
insert into public.modules (course_id, title_ar, sort_order)
select co.id, m.title_ar, m.sort_order
from public.courses co
cross join (values
  ('الأساسيات', 1),
  ('التسريحات الأساسية', 2),
  ('تسريحات المناسبات والعرائس', 3),
  ('الاحتراف والتعامل مع العملاء', 4)
) as m(title_ar, sort_order)
where co.slug = 'hairstyling-master-class'
  and not exists (
    select 1 from public.modules x
    where x.course_id = co.id and x.title_ar = m.title_ar
  );

-- ---------------------------------------------------------------------
-- Lessons — 13 lessons, 43200s total (= 12h)
-- Lesson 1 is the single free preview allowed per course (PRD §6.2).
-- ---------------------------------------------------------------------
insert into public.lessons (
  module_id, course_id, title_ar, slug, description_ar,
  duration_seconds, sort_order, is_free_preview
)
select
  mo.id, co.id, l.title_ar, l.slug, l.description_ar,
  l.duration_seconds, l.sort_order, l.is_free_preview
from public.courses co
join (values
  ('الأساسيات', 'مقدمة الدورة وأدوات العمل', 'intro-and-tools',
   'ما الذي تتضمنه الدورة، وما الأدوات اللازمة فعلًا وما يمكن تأجيله.', 1800, 1, true),
  ('الأساسيات', 'تحضير الشعر: الغسيل والتجهيز', 'hair-prep',
   'تجهيز الشعر قبل أي تسريحة ليثبت ويتحمّل.', 3000, 2, false),
  ('الأساسيات', 'أساسيات السشوار والفرد', 'blow-dry-basics',
   'مسك الفرشاة، اتجاه الهواء، والفرد دون إضرار بالشعر.', 3600, 3, false),
  ('التسريحات الأساسية', 'الكيرلي والويفي بالبيبي ليس', 'curls-and-waves',
   'أنواع اللفّة والفرق بينها، والحرارة المناسبة لكل نوع شعر.', 3300, 4, false),
  ('التسريحات الأساسية', 'الضفائر الأساسية', 'basic-braids',
   'الضفيرة العادية والثلاثية وطريقة الشد الصحيحة.', 2700, 5, false),
  ('التسريحات الأساسية', 'الضفيرة الفرنسية والهولندية', 'french-dutch-braids',
   'الفرق بينهما والتنفيذ خطوة بخطوة على شعر حقيقي.', 3300, 6, false),
  ('التسريحات الأساسية', 'الشينيون الكلاسيكي', 'classic-chignon',
   'بناء الشينيون من الأساس والتثبيت الذي يتحمّل يومًا كاملًا.', 3600, 7, false),
  ('تسريحات المناسبات والعرائس', 'الهاف أب هاف داون', 'half-up-half-down',
   'أكثر التسريحات طلبًا في المناسبات وطريقة ضبط توازنها.', 3000, 8, false),
  ('تسريحات المناسبات والعرائس', 'تسريحة العروس الكلاسيكية', 'classic-bridal',
   'لوك عروس كامل من التقسيم حتى الفينش.', 4200, 9, false),
  ('تسريحات المناسبات والعرائس', 'تسريحة العروس المودرن', 'modern-bridal',
   'اللوك المودرن المطلوب حاليًا وتنفيذه بأدوات بسيطة.', 4200, 10, false),
  ('تسريحات المناسبات والعرائس', 'تركيب الطرحة والإكسسوار', 'veil-and-accessories',
   'تثبيت الطرحة دون الإخلال بالتسريحة، ومواضع الإكسسوار الصحيحة.', 3000, 11, false),
  ('الاحتراف والتعامل مع العملاء', 'الفينش والتثبيت واللمسات الأخيرة', 'finishing-and-hold',
   'الفينش الذي يفرق بين العمل الهاوي والمحترف.', 3600, 12, false),
  ('الاحتراف والتعامل مع العملاء', 'التعامل مع العميلة والتسعير وبناء البورتفوليو', 'clients-pricing-portfolio',
   'تسعير العمل، التعامل مع طلبات العميلة، وبناء بورتفوليو يجلب العمل.', 3900, 13, false)
) as l(module_title, title_ar, slug, description_ar, duration_seconds, sort_order, is_free_preview)
  on true
join public.modules mo
  on mo.course_id = co.id and mo.title_ar = l.module_title
where co.slug = 'hairstyling-master-class'
on conflict (course_id, slug) do nothing;

-- ---------------------------------------------------------------------
-- Testimonials — PRD §9.2.
--
-- Transcribed from the client's Instagram / WhatsApp screenshots of
-- IN-PERSON workshops. There are zero online students, so every row is
-- source = 'in_person_training' and the UI labels them as such. Do not
-- relabel these as online-course reviews.
--
-- Text is verbatim as the owner transcribed it, emoji included. Each
-- original message stays on its own line — these were separate DMs and
-- stories, and merging them into one paragraph reads as edited marketing
-- copy rather than as something a person actually sent. The UI splits on
-- the newlines and renders one line per message, so E'' strings are used
-- here rather than plain literals.
--
-- The academy owner has confirmed publication permission for all of them,
-- which is why permission_status is 'granted' — the
-- testimonials_publish_requires_permission constraint refuses to publish a
-- row otherwise.
-- ---------------------------------------------------------------------
insert into public.testimonials
  (name, handle, role_ar, body_ar, rating, source, media_type, asset_path,
   permission_status, is_published, sort_order, locale)
select v.*
from (values
  ('تينا', 'tena.hairstylist', 'هير ستايلست — التدريب الحضوري',
   E'نتيجة الكورس اللي أحب أشوفها 👌\nطبقت كل الكلام اللي قولتيه في الكورس ودي النتيجة ❤️',
   5, 'in_person_training'::public.testimonial_source, 'result_photo'::public.testimonial_media,
   'testimonials/img-0008.jpg', 'granted'::public.permission_status, true, 1, 'ar'::public.locale_code),

  ('فيرو', 'vero_hairdresser', 'هير دريسر — التدريب الحضوري',
   E'حلاوة كورساتك لينا دي ❤️\nبجد يا ميري مش عارفة أشكرك إزاي، استفدت بطريقة متتخيلهاش. مكنتش بطلّع الفينش ده قبل كده خالص.\nبجد شكرًا ع كل معلومة ❤️\nكورس مع ميري يعني السيزون الجاي كله هيولّع الدنيا 😉',
   5, 'in_person_training', 'screenshot', 'testimonials/img-0011.jpg', 'granted', true, 2, 'ar'),

  ('نانسي ألفونس', 'nancyalfonc_hairstylist12', 'هير ستايلست — ورشة القاهرة 2025',
   E'أول ما بدأت كنت بحلم إمتى آخد كورس مع ماري. حقيقي خطوة كان لازم تتاخد. استمتعت معاكي جدًا جدًا جدًا.\nماري من أشطر الناس مش بس في المجال ده، هي أستاذة في الشرح، بترد على اللي في دماغك من غير ما حد يسأل.\nبنصح أي حد سألني على كورس إنه لازم يروح كورس ماري، هي أكفأ حد يوصّل معلومة، مفيش أشطر منها، وهيستمتع بجد مش مجرد شغل.',
   5, 'in_person_training', 'certificate', 'testimonials/img-0002.jpg', 'granted', true, 3, 'ar'),

  ('هبة العشري', 'heba_alashryy_veil_design', 'مصممة طرح — التدريب الحضوري',
   E'أشطر واحدة وبجد استفدت منها كتير. وعندها ضمير في الشرح وعندها صبر رهيب، وبتقول كل حاجة ومش بتبخل بمعلومة ❤️\nأنا أول مرة من يوم ما بدأت من ٣ سنين آخد كورس، وبجد مش ندمانة خالص إني كنت معاكي ❤️',
   5, 'in_person_training', 'screenshot', 'testimonials/img-0004.jpg', 'granted', true, 4, 'ar'),

  ('متدربة سابقة', null, 'خريجة التدريب الحضوري',
   E'من أول ما اشتغلت وأنا أي مشكلة كانت بتحصل بكلّمها تظبط هي كل اللخبطة، من غير ما تعرفني ولا هي تكون مجبرة على ده. ممتنة ليها حقيقي ❤️',
   5, 'in_person_training', 'screenshot', 'testimonials/img-0006.jpg', 'granted', true, 5, 'ar'),

  ('فاتن أيمن', null, 'متدربة في التدريب الحضوري',
   E'لما قلت عايزة آخد كورس شعر والكل رشّحك — يا كتني تستاهلي إن الكل يختارك.\nمش خسارة فيكي الـ ١٢ ساعة طريق علشان أحضر معاكي. بحبك أوي ❤️',
   5, 'in_person_training', 'certificate', 'testimonials/img-0001.jpg', 'granted', true, 6, 'ar'),

  ('متدربة — مجموعة الكورس 15', null, 'التدريب الحضوري — أغسطس 2024',
   E'تاني كورس أحضره مع ميري. حقيقي هي كانت السبب الأول بعد ربنا ليا في كل تطوراتي.\nومش معناه إني باخد معاها تاني إن دي قلة شرح ولا مستفدتش — بالعكس، ميري حد عنده ضمير أوي وصبووور جدًا.\nكل مرة بتعمل تكنيكس مختلفة وبستفاد جدًا. حقيقي كانوا أحلى وألذ ٣ أيام معاكي 😍',
   5, 'in_person_training', 'screenshot', 'testimonials/img-0003.jpg', 'granted', true, 7, 'ar'),

  ('تهاني إميل', null, 'دورة يونيو الحضورية',
   E'يا ماري شكرًا على تعبك ومجهودك وأمانتك معانا في كل معلومة بتقوليها لينا 🙏\nوإزاي بتخلّي عندنا طاقة وشغف وحماس إننا نيجي كل يوم ونقعد الوقت ده كله من غير ما نزهق أو نمل — بالعكس بجد بنبقى مبسوطين أوي ومش عايزين نمشي.\nبعيدًا عن الشغل، إنتي كشخصية حد لذيذ وخفيف ع القلب وبتحب تهزر — وده اللي بيخلي الكورس وقته لذيذ وكلنا متحمسين نيجي نشوفك.\nعقبال كل كورس، واحنا دايمًا بنتعلم منك ومن شطارتك.',
   5, 'in_person_training', 'screenshot', 'testimonials/img-0007.jpg', 'granted', true, 8, 'ar'),

  ('سوزي طوبار', 'souzy_toubar_veil_hairdresser', 'مصممة طرح ومصففة — التدريب الحضوري',
   E'حقيقي من أحلى الكورسات اللي حضرتها، وبجد استفدت جداا. شكرًا بجد على كل حاجة ❤️❤️',
   5, 'in_person_training', 'certificate', 'testimonials/img-0000.jpg', 'granted', true, 9, 'ar'),

  ('مارينا سمير', null, 'التدريب الحضوري — القاهرة 2024',
   E'ماري شكرًا أوي بجد، الـ ٣ أيام فرقوا معايا أوي وحقيقي طلعت بتركات جديدة 🥹\nكفاية إني شفتك مرة تانية ✨ وشكرًا ع السشوار ده اللي بجد فرّحني 😂',
   5, 'in_person_training', 'certificate', 'testimonials/img-0009.jpg', 'granted', true, 10, 'ar'),

  ('Ayaat Khalil', 'ayaat_khalil_veil_designer', 'Veil designer — in-person workshop',
   E'She''s truly a professional hairdresser ✨ Her finishing is absolutely perfect!',
   5, 'in_person_training', 'screenshot', 'testimonials/img-0010.jpg', 'granted', true, 11, 'en')
) as v(name, handle, role_ar, body_ar, rating, source, media_type, asset_path,
       permission_status, is_published, sort_order, locale)
-- Seed only into an empty table so re-running never duplicates rows.
where not exists (select 1 from public.testimonials);

-- ---------------------------------------------------------------------
-- Storage buckets for marketing imagery. Public read; writes are admin-only
-- (see the storage_bucket_policies migration).
--   testimonials/ — the original screenshots, if the academy ever wants to
--                   show them alongside the text
--   media/        — logo, hero photography, course thumbnails
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('testimonials', 'testimonials', true, 10485760,
   array['image/jpeg','image/png','image/webp','image/avif']),
  ('media', 'media', true, 10485760,
   array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
