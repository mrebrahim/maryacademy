import { Ornament } from '@/components/ui/brand-mark'

/** Shared navy banner at the top of every inner page. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(201,162,75,0.18),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16">
        <h1 className="text-3xl text-white sm:text-4xl">{title}</h1>
        <Ornament className="mx-auto mt-5 h-8 w-56" />
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-loose text-cream-50/85">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
