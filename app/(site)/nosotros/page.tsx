import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { WhyUs } from "@/components/landing/Sections";
import { Process } from "@/components/landing/Process";
import { IMAGES } from "@/lib/content/credits";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Una firma multidisciplinaria con un método claro: escuchar, explicar y actuar con estrategia.",
  alternates: { canonical: "/nosotros" },
};

const PRINCIPLES = [
  ["Franqueza", "Te decimos qué es posible y qué no, aunque no sea lo que esperabas oír."],
  ["Reserva", "Tu caso está protegido por el secreto profesional y por la ley de protección de datos."],
  ["Claridad", "Alcance y honorarios por escrito antes de empezar cualquier servicio."],
  ["Responsabilidad", "No prometemos resultados judiciales; nos comprometemos con el trabajo bien hecho."],
];

export default async function NosotrosPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Nosotros" lead={s.about_text} image={IMAGES.columnas} imageAlt="Columnas corintias en un edificio institucional" />
      <section aria-labelledby="principios" className="bg-navy py-[var(--section-gap)]">
        <div className="frame grid gap-12 lg:grid-cols-12">
          <h2 id="principios" data-reveal className="font-display text-[clamp(40px,4.6vw,72px)] lg:col-span-4">
            Lo que no negociamos
          </h2>
          <dl className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {PRINCIPLES.map(([t, d]) => (
              <div key={t} data-reveal>
                <dt className="font-display text-[clamp(28px,2.6vw,40px)] leading-none">{t}</dt>
                <dd className="mt-3 text-[17px] text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <figure data-reveal className="duotone relative h-[70svh]">
        <Image src={IMAGES.candelaria.src} alt="Calle de La Candelaria, Bogotá, con los cerros orientales al fondo" fill sizes="100vw" className="object-cover" />
      </figure>
      <WhyUs />
      <Process />
      <section className="bg-carbon py-[var(--section-gap)]">
        <div className="frame flex flex-col items-start gap-6">
          <h2 data-reveal className="font-display text-[clamp(40px,5vw,80px)]">Conoce al equipo</h2>
          <Link data-reveal href="/abogados" className="btn btn-primary">
            Ver nuestros abogados
          </Link>
        </div>
      </section>
    </>
  );
}
