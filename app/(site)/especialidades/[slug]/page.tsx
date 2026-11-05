import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLawyers, getSettings, getSpecialties, getSpecialtyBySlug } from "@/lib/data";
import { SPECIALTIES_SEED } from "@/lib/content/specialties";
import { IMAGES, SPECIALTY_IMAGE } from "@/lib/content/credits";
import { PageHeader } from "@/components/site/PageHeader";
import { LawyerCard } from "@/components/site/LawyerCard";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { Faq } from "@/components/landing/Sections";
import { whatsappUrl } from "@/lib/whatsapp";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SPECIALTIES_SEED.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSpecialtyBySlug(slug);
  if (!s) return { title: "Especialidad no encontrada" };
  return {
    title: s.name,
    description: s.summary,
    alternates: { canonical: `/especialidades/${s.slug}` },
    openGraph: { title: s.name, description: s.summary },
  };
}

export default async function EspecialidadPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [s, settings, lawyers, all] = await Promise.all([getSpecialtyBySlug(slug), getSettings(), getLawyers(slug), getSpecialties()]);
  if (!s) notFound();

  const wa = whatsappUrl(settings.whatsapp_number, `Hola, quisiera orientación sobre ${s.name.toLowerCase()}.`);
  const requestHref = `/panel/nueva-solicitud?especialidad=${s.slug}`;
  const others = all.filter((o) => o.slug !== s.slug);
  const area = s.name.charAt(0).toLowerCase() + s.name.slice(1);
  const main = SPECIALTY_IMAGE[s.slug] ?? IMAGES.columnas;
  const pool = Object.values(IMAGES).filter((i) => i.src !== main.src);
  const idx = all.findIndex((o) => o.slug === s.slug);
  const band = pool[idx % pool.length];
  const side = pool[(idx + 2) % pool.length];

  return (
    <>
      <PageHeader title={s.name} lead={s.summary} image={main} imageAlt={main.title}>
        <Link href={requestHref} className="btn btn-primary">
          Solicitar asesoría
        </Link>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <WhatsAppIcon className="h-5 w-5" /> Hablar por WhatsApp
          </a>
        ) : (
          <Link href="/contacto" className="btn btn-secondary">
            Contactar
          </Link>
        )}
      </PageHeader>

      <section aria-labelledby="descripcion" className="bg-carbon pb-[var(--section-gap)]">
        <div className="frame grid gap-8 lg:grid-cols-12">
          <h2 id="descripcion" data-reveal className="font-display text-[clamp(32px,3.4vw,52px)] lg:col-span-4">
            Cómo trabajamos esta área
          </h2>
          <p data-reveal className="text-[clamp(19px,1.6vw,24px)] leading-[1.45] lg:col-span-7 lg:col-start-6">
            {s.description}
          </p>
        </div>
      </section>

      <figure data-reveal className="duotone relative h-[56svh]">
        <Image src={band.src} alt={band.title} fill sizes="100vw" className="object-cover" />
      </figure>

      <section aria-label="Problemas y servicios" className="bg-navy py-[var(--section-gap)]">
        <div className="frame grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 data-reveal className="font-display text-[clamp(32px,3.4vw,52px)]">Problemas que resolvemos</h2>
            <ul className="mt-10 space-y-6">
              {s.problems.map((p) => (
                <li key={p} data-reveal className="text-[19px] leading-snug">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 data-reveal className="font-display text-[clamp(32px,3.4vw,52px)]">Servicios</h2>
            <ul className="mt-10 space-y-4">
              {s.services.map((sv) => (
                <li key={sv} data-reveal className="flex gap-4 text-[18px]">
                  <span aria-hidden className="mt-[0.55em] h-2 w-2 shrink-0 bg-mist" />
                  {sv}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="abogados-area" className="bg-carbon py-[var(--section-gap)]">
        <div className="frame">
          <h2 id="abogados-area" data-reveal className="font-display text-[clamp(32px,3.4vw,52px)]">
            Abogados en {area}
          </h2>
          {lawyers.length ? (
            <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
              {lawyers.map((l) => (
                <LawyerCard key={l.id} lawyer={l} selectHref={`${requestHref}&abogado=${l.id}`} />
              ))}
            </div>
          ) : (
            <div data-reveal className="mt-10 grid gap-6 lg:grid-cols-12">
              <div className="flex flex-col justify-end gap-5 bg-graphite p-8 lg:col-span-5">
                <p className="font-display text-[clamp(28px,2.6vw,40px)] leading-none">Equipo en incorporación</p>
                <p className="text-[17px] text-ink-soft">
                  Pronto publicaremos los perfiles de esta área. Puedes enviar tu solicitud ahora y la asignaremos al
                  profesional que corresponda.
                </p>
                <Link href={requestHref} className="btn btn-primary self-start">
                  Solicitar asesoría
                </Link>
              </div>
              <figure className="duotone relative aspect-[16/10] lg:col-span-7">
                <Image src={side.src} alt={side.title} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
              </figure>
            </div>
          )}
        </div>
      </section>

      {s.faqs.length ? <Faq faqs={s.faqs} title={`Preguntas sobre ${area}`} /> : null}

      <section aria-labelledby="cta" className="bg-mist py-[var(--section-gap)] text-navy on-mist">
        <div className="frame grid gap-8 lg:grid-cols-12">
          <h2 id="cta" data-reveal className="font-display text-[clamp(40px,5vw,80px)] lg:col-span-7">
            ¿Tu caso es de {area}?
          </h2>
          <div data-reveal className="flex flex-col gap-5 lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-[17px]">
              Cuéntanos qué pasó. La información de tu caso es confidencial y no se comparte con terceros.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={requestHref} className="btn btn-primary">
                Solicitar asesoría
              </Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-carbon text-ink hover:bg-navy">
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Otras especialidades" className="bg-carbon py-16">
        <div className="frame">
          <h2 className="text-[17px] text-ink-soft">Otras especialidades</h2>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/especialidades/${o.slug}`} className="font-display text-[clamp(26px,2.4vw,36px)] transition-colors hover:text-mist">
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
