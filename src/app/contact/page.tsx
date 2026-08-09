import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'

import { submitContactForm } from '@/app/actions/interest'
import { LeadForm } from '@/components/forms/lead-form'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { siteConfig, whatsappLink } from '@/config/site'

export const metadata: Metadata = {
  title: 'تواصلي معنا',
  description: 'عندك سؤال عن الدورات؟ كلمينا على واتساب أو ابعتيلنا رسالة.',
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="تواصلي معنا"
        subtitle="أي سؤال عن الدورات أو الحجز، إحنا موجودين. أسرع طريقة هي واتساب."
      />

      <section className="bg-cream-50">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-xl text-navy-900">أسرع طريقة</h2>
            <p className="mt-3 text-sm leading-loose text-muted">
              ابعتيلنا على واتساب وهنرد عليكي في أقرب وقت.
            </p>

            <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5" aria-hidden="true" />
                كلمينا على واتساب
              </a>
            </Button>

            <ul className="mt-8 space-y-4 border-t border-navy-900/10 pt-8 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
                <span className="tabular" dir="ltr">
                  {siteConfig.whatsappNumber || 'قريبًا'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
                <span dir="ltr">info@marieragaieacademy.com</span>
              </li>
            </ul>
          </div>

          <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:p-8">
            <h2 className="text-xl text-navy-900">أو ابعتيلنا رسالة</h2>
            <div className="mt-5">
              <LeadForm action={submitContactForm} submitLabel="ابعتي الرسالة" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
