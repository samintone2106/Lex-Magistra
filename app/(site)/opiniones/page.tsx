import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedReviews, getLawyers, getSpecialties } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { Stars } from "@/components/site/Stars";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Opiniones",
  description: "Opiniones verificadas de usuarios de la firma, publicadas después de moderación.",
  alternates: { canonical: "/opiniones" },
};

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

export default async function OpinionesPage({ searchParams }: { searchParams: Promise<{ especialidad?: string; abogado?: string }> }) {
  const { especialidad, abogado } = await searchParams;
  const [specialties, lawyers] = await Promise.all([getSpecialties(), getLawyers()]);
  const spec = specialties.find((s) => s.slug === especialidad);
  const law = lawyers.find((l) => l.id === abogado);
  // Filtradas y totales en paralelo (antes eran dos esperas seguidas).
  const [reviews, unfiltered] = await Promise.all([
    getApprovedReviews({ specialty: spec && /^[0-9a-f-]{36}$/i.test(spec.id) ? spec.id : undefined, lawyer: law?.id }),
    spec || law ? getApprovedReviews() : null,
  ]);
  const all = unfiltered ?? reviews;
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
  const nameOf = (id: string | null) => lawyers.find((l) => l.id === id)?.full_name;
  const specOf = (id: string | null) => specialties.find((s) => s.id === id)?.short_name;

  return (
    <>
      <PageHeader
        title="Opiniones"
        tone="navy"
        lead="Reseñas de usuarios registrados, publicadas después de una revisión para proteger datos sensibles. No escribimos, editamos ni compramos opiniones."
        aside={
          <div className="bg-carbon p-6 lg:p-8">
            <p className="font-display text-[clamp(64px,7vw,104px)] leading-none tabular-nums">{all.length ? avg.toFixed(1) : "—"}</p>
            {all.length ? (
              <div className="mt-3">
                <Stars value={avg} />
              </div>
            ) : null}
            <p className="mt-3 text-[16px]">
              {all.length
                ? `Promedio general de ${all.length} ${all.length === 1 ? "opinión" : "opiniones"}`
                : "Aún no hay opiniones publicadas"}
            </p>
          </div>
        }
      >
        <Link href="/panel/resenas/nueva" className="btn btn-primary">
          Escribir una opinión
        </Link>
      </PageHeader>

      <section aria-label="Reseñas" className="bg-carbon py-[var(--section-gap)]">
        <div className="frame grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-display text-[clamp(28px,2.4vw,38px)] leading-none">Filtrar</h2>
            <form method="get" className="mt-6 grid gap-4" aria-label="Filtrar opiniones">
              <div>
                <label htmlFor="esp" className="label">Especialidad</label>
                <select id="esp" name="especialidad" defaultValue={especialidad ?? ""} className="field">
                  <option value="">Todas</option>
                  {specialties.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.short_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="abg" className="label">Abogado</label>
                <select id="abg" name="abogado" defaultValue={abogado ?? ""} className="field">
                  <option value="">Todos</option>
                  {lawyers.map((l) => (
                    <option key={l.id} value={l.id}>{l.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">Filtrar</button>
                {spec || law ? <Link href="/opiniones" className="btn btn-ghost">Quitar filtros</Link> : null}
              </div>
            </form>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            {reviews.length ? (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} data-reveal className="bg-graphite p-6 lg:p-10">
                    <figure>
                      <Stars value={r.rating} />
                      <blockquote className="mt-4 text-[clamp(19px,1.6vw,23px)] leading-[1.5]">“{r.comment}”</blockquote>
                      <figcaption className="mt-5 text-[16px] text-ink-soft">
                        {r.show_name ? r.public_name : "Cliente verificado"} · {fmt.format(new Date(r.created_at))}
                        {specOf(r.specialty_id) ? ` · ${specOf(r.specialty_id)}` : ""}
                        {nameOf(r.lawyer_id) ? ` · Atendido por ${nameOf(r.lawyer_id)}` : ""}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            ) : (
              <div data-reveal>
                <p className="font-display text-[clamp(28px,3vw,40px)] leading-tight">
                  {spec || law ? "No hay opiniones publicadas con este filtro." : "Todavía no hay opiniones publicadas."}
                </p>
                <p className="mt-4 max-w-[52ch] text-[17px]">
                  Si ya fuiste atendido por la firma, tu opinión ayuda a otras personas a decidir.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/panel/resenas/nueva" className="btn btn-primary">
                    Escribir una opinión
                  </Link>
                  {spec || law ? (
                    <Link href="/opiniones" className="btn btn-secondary">
                      Ver todas las opiniones
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
