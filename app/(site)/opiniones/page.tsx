import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedReviews, getLawyers, getSpecialties } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { Stars } from "@/components/site/Stars";

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
  const reviews = await getApprovedReviews({ specialty: spec && /^[0-9a-f-]{36}$/i.test(spec.id) ? spec.id : undefined, lawyer: law?.id });
  const all = spec || law ? await getApprovedReviews() : reviews;
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
  const nameOf = (id: string | null) => lawyers.find((l) => l.id === id)?.full_name;
  const specOf = (id: string | null) => specialties.find((s) => s.id === id)?.short_name;

  return (
    <>
      <PageHeader
        title="Opiniones"
        lead="Reseñas de usuarios registrados, publicadas después de una revisión para proteger datos sensibles. No escribimos, editamos ni compramos opiniones."
      >
        <Link href="/panel/resenas/nueva" className="btn btn-primary">
          Escribir una opinión
        </Link>
      </PageHeader>

      <section aria-label="Reseñas" className="bg-carbon pb-[var(--section-gap)]">
        <div className="frame grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div data-reveal className="bg-navy p-6">
              <p className="font-display text-[64px] leading-none tabular-nums">{all.length ? avg.toFixed(1) : "—"}</p>
              <div className="mt-3">{all.length ? <Stars value={avg} /> : null}</div>
              <p className="mt-2 text-[15px] text-ink-soft">
                Promedio general · {all.length} {all.length === 1 ? "opinión" : "opiniones"}
              </p>
            </div>
            <form method="get" className="mt-8 grid gap-4" aria-label="Filtrar opiniones">
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
              <ul className="space-y-14">
                {reviews.map((r) => (
                  <li key={r.id} data-reveal>
                    <figure>
                      <Stars value={r.rating} />
                      <blockquote className="mt-4 text-[clamp(19px,1.6vw,23px)] leading-[1.5]">“{r.comment}”</blockquote>
                      <figcaption className="mt-4 text-[15px] text-ink-soft">
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
                <p className="mt-4 max-w-[52ch] text-[17px] text-ink-soft">
                  Si ya fuiste atendido por la firma, tu opinión ayuda a otras personas a decidir.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
