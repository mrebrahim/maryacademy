import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { LegalSection, LEGAL_UPDATED_AR } from '@/components/layout/legal-section'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description:
    'إيه البيانات اللي أكاديمية ماري رجائي بتجمعها، وليه، ومع مين بتتشارك، وإزاي تطلب مسحها.',
}

/**
 * Written from what the system actually does, not from a template.
 *
 * Every claim here is checkable against the code: the fields the forms
 * collect, the tables they land in, the trackers in src/components/
 * analytics.tsx, and the hashed identifiers src/lib/conversions.ts sends
 * to the ad platforms. A privacy policy that describes a different
 * product is worse than none — it is a written promise the site breaks on
 * every page load.
 *
 * Two things are deliberately absent because the academy has not supplied
 * them and inventing them would be a lie with legal weight: the
 * registered entity name and any commercial registration number. The
 * contact route is real and sufficient for a data request.
 *
 * Indexable on purpose, unlike most of this site's utility pages. Meta's
 * ad review looks for a reachable privacy policy before it approves a
 * campaign, and a noindex page is one more thing to argue about.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="سياسة الخصوصية" subtitle={LEGAL_UPDATED_AR} />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-base leading-loose text-ink/85">
            الصفحة دي بتشرح بالظبط إيه البيانات اللي بنجمعها منك على{' '}
            <span dir="ltr">{siteConfig.url.replace('https://', '')}</span>، وبنستخدمها في إيه،
            ومع مين بتتشارك. مكتوبة بلغة مفهومة مش بلغة محامين، وكل سطر فيها بيوصف اللي بيحصل
            فعلاً في الموقع.
          </p>

          <LegalSection title="البيانات اللي بنجمعها">
            <p>
              <strong className="text-navy-900">لما تحجز دورة:</strong> اسمك، بريدك الإلكتروني،
              رقم موبايلك، والبلد اللي اخترتها (داخل مصر أو خارجها) — لأن السعر بيختلف. وبنسجّل
              قيمة الطلب وطريقة التحويل اللي اخترتها.
            </p>
            <p>
              <strong className="text-navy-900">لما تسجّل دخولك:</strong> بريدك الإلكتروني بس.
              مفيش كلمة سر في الموقع من أصله — بنبعتلك كود على بريدك في كل مرة، فمفيش كلمة سر
              ممكن تتسرّب.
            </p>
            <p>
              <strong className="text-navy-900">وإنت بتتفرّج:</strong> الدروس اللي خلّصتها، وعدد
              الثواني اللي اتفرجت عليها في كل درس، ونتايج الامتحانات لو دخلتها. ده اللي بيخلّي
              الموقع يفكّر إنت وقفت فين، والشهادة تعرف إنك خلّصت.
            </p>
            <p>
              <strong className="text-navy-900">لو قدّمت كمدرّب:</strong> اسمك وبيانات التواصل
              وتخصصك وسنين خبرتك ولينك أعمالك، ودي بتتحفظ منفصلة عن بيانات الطلاب ومابتتشافش غير
              من إدارة الأكاديمية.
            </p>
          </LegalSection>

          <LegalSection title="بيانات الدفع">
            <p>
              <strong className="text-navy-900">
                إحنا مابنستلمش ولا بنخزّن أي بيانات بنكية.
              </strong>{' '}
              مفيش خانة رقم كارت في الموقع كله. التحويل بيتم من تطبيق إنستا باي أو محفظة فودافون
              كاش بتاعتك مباشرة، وإحنا بنشوف صورة التحويل اللي بتبعتها على واتساب بس.
            </p>
            <p>
              معناها إن أي بيانات بنكية بتاعتك بتفضل بينك وبين البنك أو شركة المحمول، وماتعديش
              علينا أصلاً.
            </p>
          </LegalSection>

          <LegalSection title="الكوكيز وأدوات القياس">
            <p>
              بنستخدم Google Analytics وMeta Pixel وTikTok Pixel عشان نعرف الإعلانات بتجيب مين،
              وأي صفحة بتشتغل وأي صفحة لأ. دي بتحط كوكيز على متصفحك.
            </p>
            <p>
              ولما تحجز، بنبعت بريدك ورقمك <strong className="text-navy-900">مشفّرين</strong> (بصيغة
              مابتترجعش لأصلها) لمنصات الإعلانات دي عشان تعرف تربط الحجز بالإعلان اللي جه منه.
              المنصات دي بتستخدمها للمطابقة والقياس حسب سياساتها هي.
            </p>
            <p>
              لو مش عايز ده، تقدر تقفل الكوكيز من إعدادات متصفحك أو تستخدم إضافة لمنع التتبّع.
              الموقع هيفضل شغّال عادي.
            </p>
          </LegalSection>

          <LegalSection title="تسجيل الجلسات">
            <p>
              بنستخدم <span dir="ltr">Microsoft Clarity</span> عشان نشوف إزاي الناس بتستخدم
              الموقع — الدوسات والتمرير وفين الصفحة بتلخبط. ده بيسجّل حركتك على الصفحة بشكل
              مجهول، من غير ما يربطها باسمك.
            </p>
            <p>
              <strong className="text-navy-900">والتسجيل ده بيقف عند تسجيل الدخول.</strong>{' '}
              صفحات حسابك ودروسك ولوحة الإدارة مابيتسجّلش فيها أي حاجة — لأن اللي بيظهر على
              الشاشة هناك بيانات شخصية ومحتوى مدفوع.
            </p>
          </LegalSection>

          <LegalSection title="فين بتتخزّن بياناتك">
            <p>
              بيانات الحساب والطلبات والتقدّم بتتخزّن على خوادم{' '}
              <span dir="ltr">Supabase</span> في الاتحاد الأوروبي (السويد). وفيديوهات الدروس
              بتتخزّن وبتتشغّل من <span dir="ltr">Bunny Stream</span>.
            </p>
            <p>
              الوصول لقاعدة البيانات محكوم بصلاحيات على مستوى كل صف — يعني حسابك مايقدرش يقرا
              بيانات حساب تاني، حتى لو حاول.
            </p>
          </LegalSection>

          <LegalSection title="مع مين بنشارك البيانات">
            <p>
              <strong className="text-navy-900">مابنبيعش بياناتك لأي حد، ولا مرة.</strong>
            </p>
            <p>
              وبنشاركها بس مع مقدّمي الخدمات اللي الموقع شغّال بيهم: استضافة قاعدة البيانات
              والحسابات، استضافة الفيديو، ومنصات الإعلانات (مشفّرة زي ما شرحنا فوق). كل واحد
              فيهم بياخد الحد الأدنى اللي يخليه يشتغل.
            </p>
          </LegalSection>

          <LegalSection title="حقوقك">
            <p>
              تقدر في أي وقت تطلب نسخة من بياناتك، أو تصحيح أي حاجة فيها غلط، أو مسح حسابك
              بالكامل. ابعتلنا من البريد اللي مسجّل بيه الحساب وهنرد عليك.
            </p>
            <p>
              مسح الحساب معناه مسح بياناتك الشخصية وتقدّمك في الدورات. سجلّات الدفع بتفضل
              للمدة اللي القانون بيطلبها للمحاسبة.
            </p>
          </LegalSection>

          <LegalSection title="التواصل" last>
            <p>
              لأي سؤال عن خصوصيتك أو طلب متعلّق ببياناتك:
              <br />
              <a
                href={`mailto:${siteConfig.email}`}
                dir="ltr"
                className="text-gold-600 underline underline-offset-4"
              >
                {siteConfig.email}
              </a>
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  )
}
