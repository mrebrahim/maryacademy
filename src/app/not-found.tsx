import Link from 'next/link'

import { Ornament } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="bg-navy-900">
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <p className="tabular font-display text-6xl text-gold-500">404</p>
        <Ornament className="mx-auto mt-6 h-8 w-56" />
        <h1 className="mt-6 text-2xl text-white">الصفحة دي مش موجودة</h1>
        <p className="mt-4 text-cream-50/80">يمكن اللينك اتغير أو اتكتب غلط.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="md">
            <Link href="/">الرجوع للرئيسية</Link>
          </Button>
          <Button asChild variant="secondary" size="md">
            <Link href="/courses">شوفي الدورات</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
