/** Sección de un formulario largo: explicación a la izquierda, campos a la derecha. */
export function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const id = `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-white/[0.06] pt-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 id={id} className="text-[16px] font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">{description}</p>
      </div>
      <div className="grid content-start gap-5">{children}</div>
    </section>
  );
}
