/**
 * Sales copy for the hairstyling VSL landing page.
 *
 * Every line here traces to Marie's own customer-research answers — the
 * quotes are the ones her buyers actually send her, the objections are the
 * three she says she hears most, and the promise is hers verbatim: "هدفي إنك
 * لما تطلع من الكورس وتشوف أي تسريحة تعرف هي اتعملت إزاي". Nothing is
 * invented, because invented sales copy is what makes a page stop sounding
 * like the person selling.
 *
 * Register is light Egyptian colloquial, unlike the rest of the site, which
 * is MSA. A sales page has to sound like the reader's own voice, and every
 * quote in the research is colloquial. The two registers are deliberate,
 * not an oversight — say the word and this moves to MSA too.
 *
 * Copy lives in config rather than in the component so it can be edited
 * without touching layout. Course facts — lesson count, duration, price —
 * still come from the database, never from here.
 */

export const landingCopy = {
  /** Bunny GUID for the VSL. Until it is set, the hero renders no media. */
  vslVideoId: null as string | null,

  /**
   * Lessons shown from inside the course — the single most convincing
   * thing on the page after the testimonials, because it lets someone
   * judge the teaching instead of taking a claim on trust.
   *
   * ⚠️ Anything listed here is PUBLIC, permanently. The id lands in the
   * page source of a page built to be seen by strangers, and token
   * authentication is off, so whoever reads it can play the whole video
   * anywhere. That is the opposite of what the SELECT revoke on
   * `lessons.bunny_video_id` is for — so a lesson belongs here only when
   * the academy means to give it away.
   *
   *   * التجهيزات is the course's one free preview, so publishing it
   *     whole changes nothing.
   *   * اللوك الثاني is a paid 49-minute lesson, capped at two minutes by
   *     `maxSeconds`. The cap shapes the page; it does not protect the
   *     file — see src/components/landing/capped-video.tsx. A separately
   *     uploaded two-minute cut is the only version that does, and
   *     swapping its id in here (and dropping `maxSeconds`) is the whole
   *     change.
   *
   * The section disappears entirely while the list is empty; it never
   * renders a frame with nothing in it.
   */
  previewClips: [
    { videoId: '1194f2a6-073c-4c98-8acd-ec8d2820191e', titleAr: 'التجهيزات — الدرس الأول كامل' },
    {
      videoId: 'a94346cf-9196-4924-82d6-f17bc031da4c',
      titleAr: 'من اللوك الثاني — أول دقيقتين',
      maxSeconds: 120,
    },
  ] as { videoId: string; titleAr: string; maxSeconds?: number }[],

  hero: {
    kicker: 'كورس تصفيف الشعر الاحترافي — أونلاين',
    // Marie's own stated goal for every trainee, turned into the promise.
    headline: 'تشوف أي تسريحة، وتعرف اتعملت إزاي',
    sub: 'من التجهيز لحد الفينيش النهائي — بالتفاصيل الصغيرة اللي الفيديوهات بتعدّي عليها من غير ما تقولهالك.',
    cta: 'احجز مكانك',
    videoNote: 'شغّل الفيديو بالصوت',
  },

  /** Verbatim from the research: "الجملة اللي بتتكرر أكتر حاجة على لسان عملائك". */
  painQuotes: [
    'بعرف أعمل الأساسيات، بس مش بعرف أطلّع لوك كامل لوحدي.',
    'بتعلّم وبفهم، وأول ما أجي أطبّق لوحدي بتلخبط.',
    'حضرت كورسات قبل كده، ولسه مش واثق إني أقدر أشتغل لوحدي.',
    'نفسي أتعلّم التسريحات دي بس مش عارف أبدأ منين.',
    'محتاج حد يعلّمني عملي ويقوللي أنا بعمل إيه غلط.',
  ],

  /** The reframe. Her answer to "إيه اللي العميل فاكره صح وهو غلط". */
  reframe: {
    title: 'المشكلة مش إنك مش شاطر',
    quote: 'إنك تفهم التسريحة وإنت بتتفرّج عليها، مش معناه إنك عرفت تعملها بإيدك.',
    body: [
      'الفيديو بيوريك النتيجة. مش بيوريك الشدّة، ولا زاوية المشط، ولا اللحظة اللي المفروض تسيب فيها الخصلة. التفاصيل الصغيرة دي هي اللي بتفرق بين لوك ثابت ولوك بيقع بعد ساعتين.',
      'وعشان كده ناس كتير بتتفرّج شهور، وتفهم كل خطوة، وأول ما تحط إيدها تلاقي النتيجة مختلفة. مش نقص موهبة — نقص التفاصيل اللي محدش وقف يقولهالك.',
    ],
  },

  /** From "العميل بعد ما يتعامل معاك، إيه اللي بيتغيّر" + the cost-of-inaction answers. */
  outcomes: [
    {
      titleAr: 'الفينيش يفرق ١٨٠ درجة',
      bodyAr: 'ده الفرق اللي المتدربين بيقولوه بنفسهم أول ما يخلّصوا ويطبّقوا.',
    },
    {
      titleAr: 'تطلّع لوك كامل لوحدك',
      bodyAr: 'من التقسيم للتثبيت للفينيش — من غير ما تستنى حد يظبطهولك.',
    },
    {
      titleAr: 'تبتكر، مش تحفظ',
      bodyAr: 'من اللوك الواحد تعرف تطلّع أكتر من فكرة، بدل ما تحفظ خطوات وتنساها.',
    },
    {
      titleAr: 'ترفع سعرك',
      bodyAr: 'لما الشغل يتحسّن، تقدر تغلّي سعرك وتاخد شغل أكتر — ده اللي بيحصل فعلًا.',
    },
  ],

  /** The four buyer profiles she described, in her own framing. */
  audience: [
    'شغال في صالون وما بتعرفش تعمل تسريحات، وده مأثّر على دخلك.',
    'في مجال تاني وعايز تغيّره خالص وتشتغل شغل حر.',
    // 'فيل' was a typo for a neighbouring trade; corrected to the two
    // the academy actually names. // TODO: confirm with Marie.
    'شغال في مجال قريب — كوافير أو مكياج — وعايز تضيف التسريحات لخدماتك.',
    'عندك صالون وخبرة سنين، وناقصك بس اللوكات الجديدة.',
  ],

  /** Her stated differentiators, "إيه الحاجة اللي محدش تاني بيعملها بنفس الطريقة". */
  mechanism: {
    title: 'إيه اللي مختلف هنا',
    items: [
      {
        titleAr: 'من التجهيز للفينيش، مش من النص',
        bodyAr: 'الكورس بيبدأ من أول خطوة، فسواء إنت مبتدئ أو عندك خبرة، هتلاقي حتّتك.',
      },
      {
        titleAr: 'الاستايل المطلوب دلوقتي',
        bodyAr: 'شغل العرايس باللوكات اللي السوق طالبها حاليًا، مش لوكات عدّى عليها سنين.',
      },
      {
        titleAr: 'أدق التفاصيل',
        bodyAr: 'الحاجات اللي بتتقال وإنت واقف جنب المدرّب — مش اللي بتتشرح في فيديو دقيقتين.',
      },
      {
        titleAr: 'تفكير، مش تلقين',
        bodyAr: 'بنعلّمك تفكّر إزاي تبني لوك، عشان تقدر تعمل حاجة مشفتهاش قبل كده.',
      },
    ],
  },

  /** Her strongest proof line, from "أقوى ٣ نتايج حققتها لعملاء". */
  proof: {
    title: 'أقوى دليل عندنا',
    body: 'ناس أخدت الكورس، وشغلها فرق لدرجة إنهم دلوقتي بيدّوا كورسات لناس تانية.',
  },

  /** Her three most common refusals, in the buyers' words, each answered. */
  objections: [
    {
      q: 'المكان بعيد عليّا، أنا من محافظة تانية.',
      a: 'ده كان أكتر سبب بيمنع الناس فعلًا. الكورس أونلاين دلوقتي — مفيش سفر، ومفيش مكان أصلًا. بتذاكر من محافظتك وفي وقتك.',
    },
    {
      q: 'خايف أدفع وفي الآخر ما أعرفش أطبّق.',
      a: 'التعلّم بيحصل بالإيد. لازم تجرّب كتير وتغلط — ده اللي حصل مع ماري نفسها. والفرق هنا إن الدروس مقسّمة خطوة خطوة، وترجعلها وقت ما تحب، مش مرة واحدة وخلاص.',
    },
    {
      q: 'أنا لسه مبتدئ خالص، ده كتير عليّا.',
      a: 'الكورس بيبدأ من إمساك الفرشاة. مش مطلوب منك تكون محترف قبل ما تبدأ — المطلوب إنك مستعد تتعلّم وتطبّق.',
    },
  ],

  /** Verbatim: her "أكتر ٥ أسئلة بتتسأل قبل الشراء". */
  faq: [
    {
      q: 'هل الكورس مناسب ليا لو أنا لسه مبتدئ؟',
      a: 'أيوه. بيبدأ من الأساسيات ومن إمساك الفرشاة، وبيتدرّج لحد تسريحات العرايس الكاملة. مش مطلوب أي خبرة سابقة.',
    },
    {
      q: 'هقدر أطبّق التسريحات لوحدي بعد الكورس؟',
      a: 'ده هدف الكورس نفسه: إنك تشوف أي تسريحة وتعرف اتعملت إزاي، وتقدر تنفّذها بإيدك. بشرط تطبّق وتكرّر — الجزء ده مسؤوليتك.',
    },
    {
      q: 'فيه تطبيق عملي ولا شرح بس؟',
      a: 'كل درس بيتنفّذ خطوة بخطوة من البداية للنتيجة النهائية، مش وصف للخطوات.',
    },
    {
      q: 'محتاج أدوات معيّنة قبل ما أبدأ؟',
      a: 'الأساسيات بس: فرشاة، سشوار، بيبي ليس، دبابيس، وإسبراي تثبيت. وأول درس بيقولك إيه اللي تجيبه من دلوقتي وإيه اللي تقدر تأجّله.',
    },
    {
      q: 'أتدرّب على مين؟',
      a: 'على موديل — قريب أو صاحب — أو على رأس تدريب. الاتنين شغّالين، والفرق بينهم موضّح جوّه الدروس.',
    },
  ],

  /** Compressed from her own story answer. */
  founder: {
    title: 'مين اللي هيعلّمك',
    body: [
      'ماري غيّرت مجالها خالص عشان بتحب التسريحات. بدأت والحجوزات قليلة جدًا، وشغلها في الأول ما كانش أحسن حاجة.',
      'أول كورس أخدته ما كانش معاها تمنه — فضلت تجمّعه. وطلبت من ناس في المجال تنزل معاهم مساعدة، فرفضوا من غير سبب. فاتعلّمت بالطريقة الوحيدة اللي كانت متاحة: تجرّب بإيدها، وتغلط، وتتعلّم من غلطها.',
      'دلوقتي هي منافستهم، وشغلها بقى أفضل — ده كلام الناس مش كلامها. وعشان عدّت بده، مبدأها إن المعلومة تتقال كاملة.',
    ],
  },

  finalCta: {
    title: 'قرار واحد',
    body: 'تفضل تتفرّج على فيديوهات وتحاول لوحدك، أو تاخد الطريق مختصر مع حد مشى فيه قبلك.',
    cta: 'احجز مكانك دلوقتي',
    secondary: 'لسه عندي سؤال',
  },
} as const
