import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { LegalSection, LEGAL_UPDATED_AR } from '@/components/layout/legal-section'
import { siteConfig, whatsappLink } from '@/config/site'

export const metadata: Metadata = {
  title: 'الشروط والأحكام',
  description: 'شروط الاشتراك في دورات أكاديمية ماري رجائي للتجميل، والدفع، والوصول للمحتوى.',
}

/**
 * Describes the product as it actually behaves: two price bands chosen by
 * a declaration, manual transfer, access after a human matches the
 * screenshot, a certificate on completion.
 *
 * Two topics are deliberately absent on the academy's explicit and
 * repeated instruction: refunds and how long access lasts. Writing either
 * one would commit the academy to a position it has not taken, and these
 * pages are the one place on the site where a sentence is a promise.
 *
 * Also absent: a registered entity name, a commercial registration number
 * and a named court. The academy has not supplied them, and inventing
 * them would be a lie that only shows up when it matters most.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader title="الشروط والأحكام" subtitle={LEGAL_UPDATED_AR} />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-base leading-loose text-ink/85">
            الشروط دي بتحكم اشتراكك في دورات أكاديمية ماري رجائي للتجميل على{' '}
            <span dir="ltr">{siteConfig.url.replace('https://', '')}</span>. باشتراكك في أي دورة
            إنت موافق عليها.
          </p>

          <LegalSection title="الاشتراك والسعر">
            <p>
              سعر كل دورة مكتوب على صفحتها. وفيه سعرين: واحد للمقيمين في مصر وواحد لغير
              المصريين، وإنت بتختار بلدك في صفحة الدفع قبل ما السعر يظهرلك.
            </p>
            <p>
              لو اخترت «من مصر» وإنت مش فيها، الأكاديمية ليها الحق إنها تطلب فرق السعر قبل ما
              تفتحلك الدورة.
            </p>
            <p>الأسعار ممكن تتغيّر في أي وقت، والتغيير مابيأثرش على اشتراك اتأكّد قبله.</p>
          </LegalSection>

          <LegalSection title="الدفع وفتح الدورة">
            <p>
              الدفع بالتحويل على إنستا باي أو فودافون كاش. مفيش دفع بالكارت على الموقع، ومفيش
              أي بيانات بنكية بتتسجّل عندنا.
            </p>
            <p>
              بعد ما تحوّل، بتبعت صورة التحويل على واتساب. الأكاديمية بتطابق التحويل بنفسها
              وبتفتحلك الدورة بعد المطابقة — يعني الوصول مابيجيش لحظة ما تدوس الزرار، بيجي بعد
              ما حد يتأكد إن الفلوس وصلت فعلاً.
            </p>
            <p>
              لو حوّلت ومافتحتش معاك خلال وقت معقول، كلّمنا على{' '}
              <a
                href={whatsappLink('السلام عليكم، حوّلت قيمة الدورة وحابب أتأكد من الحجز')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 underline underline-offset-4"
              >
                واتساب
              </a>{' '}
              ومعاك صورة التحويل.
            </p>
          </LegalSection>

          <LegalSection title="حسابك">
            <p>
              الاشتراك شخصي وليك إنت وحدك. الدخول بكود بيوصل على بريدك، فخلّي بالك من بريدك زي
              ما بتخلّي بالك من كلمة السر.
            </p>
            <p>
              مشاركة حسابك مع حد تاني، أو تسجيل الدخول من أكتر من شخص، بيخالف الشروط دي وبيعرّض
              الحساب للإيقاف.
            </p>
          </LegalSection>

          <LegalSection title="المحتوى وحقوق الملكية">
            <p>
              كل الفيديوهات والملفات والامتحانات في الدورات ملك للأكاديمية. ليك حق مشاهدتها
              للتعلّم الشخصي بس.
            </p>
            <p>
              ممنوع تسجيل الفيديوهات أو تنزيلها أو إعادة نشرها أو بيعها أو عرضها لمجموعة، سواء
              بمقابل أو من غير. المخالفة بتوقف الحساب فورًا من غير إشعار، ومابتمنعش الأكاديمية
              من اتخاذ أي إجراء قانوني.
            </p>
          </LegalSection>

          <LegalSection title="الشهادة">
            <p>
              بعد ما تخلّص كل دروس الدورة، بتطلعلك شهادة إتمام باسمك وعليها رقم يتحقق منه من
              الموقع.
            </p>
            <p>
              الشهادة دي بتثبت إنك خلّصت محتوى الدورة. هي مش ترخيص مهني ولا معادلة من أي جهة
              تعليمية رسمية.
            </p>
          </LegalSection>

          <LegalSection title="النتائج">
            <p>
              الدورات بتشرح طريقة شغل وخطوات تنفيذ. المهارة بتتبني بالتمرين، والنتيجة اللي
              هتوصلها بتعتمد على مجهودك وتدريبك — فالأكاديمية مابتضمنش نتيجة معيّنة ولا دخل
              معيّن بعد الدورة.
            </p>
          </LegalSection>

          <LegalSection title="توقف الخدمة">
            <p>
              بنحاول الموقع يفضل شغّال طول الوقت، بس ممكن يقف لفترات قصيرة للصيانة أو لأسباب
              خارجة عن إرادتنا. ده مابيأثرش على اشتراكك.
            </p>
          </LegalSection>

          <LegalSection title="تعديل الشروط">
            <p>
              ممكن نعدّل الشروط دي، والنسخة المنشورة هنا هي السارية. تاريخ آخر تحديث مكتوب فوق.
            </p>
          </LegalSection>

          <LegalSection title="القانون والتواصل" last>
            <p>الشروط دي بتخضع لقوانين جمهورية مصر العربية.</p>
            <p>
              لأي استفسار عن الشروط دي:
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
