import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedReviews, getLawyer } from "@/lib/data";
import { LawyerPortrait } from "@/components/site/LawyerCard";
import { Stars } from "@/components/site/Stars";
import { SplitHeading } from "@/components/motion/SplitHeading";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getLawyer(id);
  if (!l) return { title: "Abogado no encontrado" };
  return { title: l.full_name, description: `${l.title}. ${l.specialties.map((s) => s.short_name).join(", ")}.` };
}

function Block({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <div data-reveal className="grid gap-3 lg:grid-cols-12">
      <h2 className="text-[18px] font-semibold lg:col-span-3">{title}</h2>
      <p className="whitespace-pre-line text-[17px] leading-relaxed text-ink-soft lg:col-span-8 lg:col-start-5">{text}</p>
    </div>
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

  return (
    <article className="bg-carbon pb-[var(--section-gap)] pt-32 lg:pt-40">
      <div className="frame grid gap-10 lg:grid-cols-12">
        <div data-reveal className="group lg:col-span-4">
          <LawyerPortrait lawyer={l} priority sizes="(min-width:1024px) 33vw, 100vw" />
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <SplitHeading as="h1" trigger="load" className="font-display text-[clamp(44px,6vw,96px)]">
            {l.full_name}
          </SplitHeading>
          <p data-reveal className="mt-4 text-[19px] text-ink-soft">
            {l.title}
            {l.firm ? ` · ${l.firm.name}` : ""}
            {l.years_experience ? ` · ${l.years_experience} años de experiencia` : ""}
          </p>
          <ul data-reveal className="mt-6 flex flex-wrap gap-2">
            {l.specialties.map((s) => (
              <li key={s.slug}>
                <Link href={`/especialidades/${s.slug}`} className="inline-flex min-h-10 items-center bg-graphite px-4 text-[15px] hover:bg-navy">
                  {s.short_name}
                </Link>
              </li>
            ))}
          </ul>
          <p data-reveal className="mt-6 text-[16px] text-mist">
            {l.accepts_consultations ? l.availability : "En este momento no recibe nuevas consultas."}
          </p>
          {reviews.length ? (
            <p data-reveal className="mt-3 flex items-center gap-3 text-[16px]">
              <Stars value={avg} /> {avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"}
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
          {l.professional_card ? <p className="mt-6 text-[14px] text-ink-soft">Tarjeta profesional {l.professional_card}</p> : null}
        </div>
      </div>

      <div className="frame mt-24 space-y-14">
        <Block title="Perfil profesional" text={l.bio} />
        <Block title="Experiencia" text={l.experience} />
        <Block title="Formación académica" text={l.education} />
        {l.services.length ? (
          <div data-reveal className="grid gap-3 lg:grid-cols-12">
            <h2 className="text-[18px] font-semibold lg:col-span-3">Servicios</h2>
            <ul className="space-y-2 text-[17px] text-ink-soft lg:col-span-8 lg:col-start-5">
              {l.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-[14px] text-ink-soft">
          Seleccionar a este abogado en una solicitud no constituye contratación ni crea una relación abogado-cliente.
        </p>
      </div>
    </article>
  );
}
