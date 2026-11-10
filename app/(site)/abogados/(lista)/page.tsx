import type { Metadata } from "next";
import Link from "next/link";
import { getLawyers, getSpecialties } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { LawyerCard } from "@/components/site/LawyerCard";
import { IMAGES } from "@/lib/content/credits";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nuestros abogados",
  description: "Conoce la formación, la experiencia y las áreas de trabajo de los abogados de la firma.",
  alternates: { canonical: "/abogados" },
};

export default async function AbogadosPage({ searchParams }: { searchParams: Promise<{ especialidad?: string }> }) {
  const { especialidad } = await searchParams;
  const [specialties, lawyers] = await Promise.all([getSpecialties(), getLawyers(especialidad || undefined)]);
  const current = specialties.find((s) => s.slug === especialidad);

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center px-4 text-[16px] transition-[background-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${active ? "bg-mist text-navy" : "bg-graphite text-ink hover:bg-navy"}`;

  return (
    <>
      <PageHeader
        title="Nuestros abogados"
        lead="Explora los perfiles por especialidad. Elegir un abogado al enviar tu solicitud no crea por sí solo una relación abogado-cliente."
        image={IMAGES.escalera}
        imageAlt="Escalera de mármol de un tribunal"
        caption="Escalera del vestíbulo de un palacio de justicia"
      />
      <section aria-labelledby="directorio" className="bg-carbon py-[var(--section-gap)]">
        <div className="frame mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 id="directorio" className="font-display text-[clamp(34px,3.6vw,56px)]">
            {current ? current.name : "Directorio"}
          </h2>
          <p className="text-[16px]" aria-live="polite">
            {lawyers.length} {lawyers.length === 1 ? "perfil publicado" : "perfiles publicados"}
          </p>
        </div>
        <nav aria-label="Filtrar por especialidad" className="frame flex flex-wrap gap-2">
          <Link href="/abogados" className={chip(!current)} aria-current={!current ? "page" : undefined}>
            Todas
          </Link>
          {specialties.map((s) => (
            <Link key={s.slug} href={`/abogados?especialidad=${s.slug}`} className={chip(current?.slug === s.slug)} aria-current={current?.slug === s.slug ? "page" : undefined}>
              {s.short_name}
            </Link>
          ))}
        </nav>
        {lawyers.length ? (
          <div className="frame mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        ) : (
          <div data-reveal className="frame mt-12 max-w-[60ch]">
            <p className="font-display text-[clamp(28px,3vw,40px)] leading-tight">
              {current ? `Aún no hay perfiles publicados en ${current.short_name.toLowerCase()}.` : "Aún no hay perfiles publicados."}
            </p>
            <p className="mt-4 text-[17px]">
              Puedes enviar tu solicitud y la firma la asignará al profesional del área que corresponda.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/panel/nueva-solicitud${current ? `?especialidad=${current.slug}` : ""}`} className="btn btn-primary">
                Solicitar asesoría
              </Link>
              {current ? (
                <Link href="/abogados" className="btn btn-secondary">
                  Ver todas las áreas
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
