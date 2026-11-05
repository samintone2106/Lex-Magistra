import type { Metadata } from "next";
import Link from "next/link";
import { getLawyers, getSpecialties } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { LawyerCard } from "@/components/site/LawyerCard";
import { IMAGES } from "@/lib/content/credits";

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
    `inline-flex min-h-11 items-center px-4 text-[15px] transition-colors ${active ? "bg-mist text-navy" : "bg-graphite text-ink hover:bg-navy"}`;

  return (
    <>
      <PageHeader
        title="Nuestros abogados"
        lead="Explora los perfiles por especialidad. Elegir un abogado al enviar tu solicitud no crea por sí solo una relación abogado-cliente."
        image={IMAGES.escalera}
        imageAlt="Escalera de mármol de un tribunal"
      />
      <section aria-label="Directorio de abogados" className="bg-carbon pb-[var(--section-gap)]">
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
            <p className="mt-4 text-[17px] text-ink-soft">
              Puedes enviar tu solicitud y la firma la asignará al profesional del área que corresponda.
            </p>
            <Link href={`/panel/nueva-solicitud${current ? `?especialidad=${current.slug}` : ""}`} className="btn btn-primary mt-6">
              Solicitar asesoría
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
