import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSpecialties } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import { IMAGES, SPECIALTY_IMAGE } from "@/lib/content/credits";

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
        lead="Cada área tiene su propio equipo, sus propios procedimientos y su propia página. Elige la que corresponde a tu situación para conocer qué resolvemos y cómo."
      />
      <section aria-label="Listado de especialidades" className="bg-carbon pb-[var(--section-gap)]">
        <ul className="frame flex flex-col gap-4">
          {specialties.map((s, i) => {
            const img = SPECIALTY_IMAGE[s.slug] ?? IMAGES.columnas;
            const flip = i % 2 === 1;
            return (
              <li key={s.slug} data-reveal className="group relative grid bg-graphite lg:grid-cols-12">
                <div className={`duotone relative aspect-[16/9] lg:col-span-5 lg:aspect-auto lg:min-h-[340px] ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
                  <Image src={img.src} alt="" fill sizes="(min-width:1024px) 42vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105" />
                </div>
                <div className={`flex flex-col gap-4 p-6 lg:col-span-6 lg:p-12 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}>
                  <SpecialtyIcon name={s.icon} size={30} className="text-mist" />
                  <h2 className="font-display text-[clamp(34px,3.6vw,56px)] leading-none">{s.name}</h2>
                  <p className="max-w-[50ch] text-[17px] text-ink-soft">{s.summary}</p>
                  <p className="text-[15px] text-ink-soft">{s.services.slice(0, 3).join(" · ")}</p>
                  <Link
                    href={`/especialidades/${s.slug}`}
                    className="mt-2 inline-flex items-center gap-2 self-start text-[17px] font-medium after:absolute after:inset-0 group-hover:text-mist"
                  >
                    Conocer más
                    <ArrowUpRight aria-hidden size={18} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
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
