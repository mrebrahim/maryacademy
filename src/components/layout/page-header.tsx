/** Shared navy banner at the top of every inner page. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="grain relative overflow-hidden bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(201,162,75,0.18),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16">
        <h1 className="display text-4xl text-white sm:text-5xl">{title}</h1>
        <span className="rule-gold mx-auto mt-6 block h-px w-40" aria-hidden="true" />
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-loose text-cream-50/85">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
