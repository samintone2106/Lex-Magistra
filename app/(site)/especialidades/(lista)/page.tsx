import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSpecialties } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { IMAGES, SPECIALTY_IMAGE } from "@/lib/content/credits";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Especialidades jurídicas",
  description:
    "Derecho de tránsito, penal, económico y financiero, digital y tecnológico, migratorio y protección del buen nombre en Colombia.",
  alternates: { canonical: "/especialidades" },
};

export default async function EspecialidadesPage() {
  const specialties = await getSpecialties();
  return (
    <>
      <PageHeader
        title="Especialidades jurídicas"
        lead="Cada área tiene su propio equipo, sus propios procedimientos y su propia página. Elige la que corresponde a tu situación para conocer qué resolvemos, qué documentos traer y cómo avanza un caso."
        image={IMAGES.palacio}
        imageAlt="Fachada del Palacio de Justicia en la Plaza de Bolívar, Bogotá"
        caption="Palacio de Justicia, Plaza de Bolívar, Bogotá"
      />
      <section aria-labelledby="listado" className="bg-carbon py-[var(--section-gap)]">
        <h2 id="listado" className="sr-only">
          Listado de especialidades
        </h2>
        {specialties.length === 0 ? (
          <div data-reveal className="frame max-w-[60ch]">
            <p className="font-display text-[clamp(28px,3vw,40px)] leading-tight">Estamos actualizando las especialidades.</p>
            <p className="mt-4 text-[17px]">Mientras tanto, cuéntanos tu caso y lo dirigimos al área que corresponde.</p>
            <Link href="/contacto" className="btn btn-primary mt-6">
              Contactar
            </Link>
          </div>
        ) : null}
        <ul className="frame flex flex-col gap-4">
          {specialties.map((s, i) => {
            const img = SPECIALTY_IMAGE[s.slug] ?? IMAGES.columnas;
            const flip = i % 2 === 1;
            return (
              <li key={s.slug} data-reveal className="group relative grid bg-graphite lg:grid-cols-12">
                <div className={`duotone relative aspect-[16/9] lg:col-span-5 lg:aspect-auto lg:min-h-[340px] ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
                  <Image src={img.src} alt="" fill sizes="(min-width:1024px) 42vw, 100vw" className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.04] group-focus-within:scale-[1.04]" />
                </div>
                <div className={`flex flex-col gap-4 p-6 lg:col-span-6 lg:p-12 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}>
                  <h3 className="font-display text-[clamp(34px,3.6vw,56px)] leading-none">{s.name}</h3>
                  <p className="max-w-[50ch] text-[17px] text-ink">{s.summary}</p>
                  <ul className="mt-2 grid gap-2 text-[16px] text-ink-soft sm:grid-cols-2">
                    {s.services.slice(0, 4).map((sv) => (
                      <li key={sv} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-mist" />
                        {sv.replace(/\.$/, "")}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/especialidades/${s.slug}`}
                    className="mt-4 inline-flex items-center gap-2 self-start text-[17px] font-medium transition-colors duration-200 after:absolute after:inset-0 group-hover:text-mist focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-mist"
                  >
                    Conocer el área<span className="sr-only"> de {s.name.toLowerCase()}</span>
                    <ArrowUpRight aria-hidden size={18} className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
