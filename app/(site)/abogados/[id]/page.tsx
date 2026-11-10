import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getApprovedReviews, getLawyer } from "@/lib/data";
import { LawyerPortrait } from "@/components/site/LawyerCard";
import { Stars } from "@/components/site/Stars";
import { headlineSize } from "@/components/site/PageHeader";
import { SplitHeading } from "@/components/motion/SplitHeading";

export const revalidate = 300;
// Sin rutas precalculadas: cada perfil se genera al primer visitante y queda en caché (ISR).
export function generateStaticParams(): Params[] {
  return [];
}

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getLawyer(id);
  if (!l) return { title: "Abogado no encontrado" };
  return { title: l.full_name, description: `${l.title}. ${l.specialties.map((s) => s.short_name).join(", ")}.` };
}

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

function Block({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <section data-reveal className="bg-graphite p-6 lg:p-10">
      <h2 className="font-display text-[clamp(28px,2.4vw,38px)] leading-none">{title}</h2>
      <p className="mt-5 whitespace-pre-line text-[17px] leading-relaxed text-ink">{text}</p>
    </section>
  );
}

export default async function AbogadoPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const l = await getLawyer(id);
  if (!l) notFound();
  const reviews = await getApprovedReviews({ lawyer: l.id });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const firstSpecialty = l.specialties[0]?.slug;
  const requestHref = `/panel/nueva-solicitud?abogado=${l.id}${firstSpecialty ? `&especialidad=${firstSpecialty}` : ""}`;
  const hasProfile = [l.bio, l.experience, l.education].some((t) => t.trim()) || l.services.length > 0;

  return (
    <article className="bg-carbon pb-[var(--section-gap)] pt-32 lg:pt-40">
      <div className="frame grid gap-10 lg:grid-cols-12 lg:gap-x-6">
        <header className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <SplitHeading as="h1" trigger="load" className={`font-display ${headlineSize(l.full_name)}`}>
            {l.full_name}
          </SplitHeading>
          <p data-reveal className="mt-5 text-[19px]">
            {l.title}
            {l.firm ? ` · ${l.firm.name}` : ""}
            {l.years_experience ? ` · ${l.years_experience} años de experiencia` : ""}
          </p>
          {l.specialties.length ? (
            <ul data-reveal className="mt-6 flex flex-wrap gap-2" aria-label="Especialidades">
              {l.specialties.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/especialidades/${s.slug}`}
                    className="inline-flex min-h-11 items-center bg-graphite px-4 text-[16px] transition-[background-color,transform] duration-200 ease-[var(--ease-out)] hover:bg-navy active:scale-[0.97]"
                  >
                    {s.short_name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <p data-reveal className="mt-6 text-[17px] text-mist">
            {l.accepts_consultations ? l.availability : "En este momento no recibe nuevas consultas."}
          </p>
          {reviews.length ? (
            <p data-reveal className="mt-3 flex flex-wrap items-center gap-3 text-[16px]">
              <Stars value={avg} /> {avg.toFixed(1)} ·{" "}
              <a href="#opiniones" className="link">
                {reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"}
              </a>
            </p>
          ) : null}
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            {l.accepts_consultations ? (
              <Link href={requestHref} className="btn btn-primary">
                Solicitar asesoría
              </Link>
            ) : null}
            <Link href="/abogados" className="btn btn-secondary">
              Ver otros abogados
            </Link>
          </div>
          {l.professional_card ? <p className="mt-6 text-[16px] text-ink-soft">Tarjeta profesional {l.professional_card}</p> : null}
        </header>

        <div className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div data-reveal className="group mx-auto max-w-[420px] lg:sticky lg:top-28 lg:max-w-none">
            <LawyerPortrait lawyer={l} priority sizes="(min-width:1024px) 40vw, 420px" />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:mt-14">
          {hasProfile ? (
            <>
              <Block title="Perfil profesional" text={l.bio} />
              <Block title="Experiencia" text={l.experience} />
              <Block title="Formación académica" text={l.education} />
              {l.services.length ? (
                <section data-reveal className="bg-graphite p-6 lg:p-10">
                  <h2 className="font-display text-[clamp(28px,2.4vw,38px)] leading-none">Servicios</h2>
                  <ul className="mt-5 space-y-3 text-[17px]">
                    {l.services.map((s) => (
                      <li key={s} className="flex gap-4">
                        <span aria-hidden className="mt-[0.6em] h-2 w-2 shrink-0 bg-mist" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : (
            <section data-reveal className="bg-graphite p-6 lg:p-10">
              <h2 className="font-display text-[clamp(28px,2.4vw,38px)] leading-none">Perfil en preparación</h2>
              <p className="mt-5 text-[17px]">
                Pronto publicaremos la formación y la experiencia de este abogado. Puedes enviar tu solicitud y la firma
                te contactará.
              </p>
            </section>
          )}
          <p className="mt-4 text-[16px] text-ink-soft">
            Seleccionar a este abogado en una solicitud no constituye contratación ni crea una relación abogado-cliente.
          </p>
        </div>
      </div>

      {reviews.length ? (
        <section id="opiniones" aria-labelledby="opiniones-title" className="frame mt-[var(--section-gap)] scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="opiniones-title" data-reveal className="font-display text-[clamp(34px,3.6vw,56px)]">
              Opiniones de clientes
            </h2>
            <Link data-reveal href={`/opiniones?abogado=${l.id}`} className="btn btn-ghost">
              Ver todas <ArrowUpRight aria-hidden size={18} />
            </Link>
          </div>
          <ul className="mt-12 grid gap-3 lg:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <li key={r.id} data-reveal className="flex flex-col bg-navy p-6 lg:p-8">
                <figure className="flex h-full flex-col">
                  <Stars value={r.rating} />
                  <blockquote className="mt-4 flex-1 text-[18px] leading-[1.5]">“{r.comment}”</blockquote>
                  <figcaption className="mt-6 text-[16px]">
                    {r.show_name ? r.public_name : "Cliente verificado"} · {fmt.format(new Date(r.created_at))}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
