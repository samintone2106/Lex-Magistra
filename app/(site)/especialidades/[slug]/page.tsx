import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getLawyers, getSettings, getSpecialties, getSpecialtyBySlug } from "@/lib/data";
import { SPECIALTIES_SEED } from "@/lib/content/specialties";
import { SPECIALTY_DETAILS } from "@/lib/content/specialty-details";
import { IMAGES, SPECIALTY_IMAGE } from "@/lib/content/credits";
import { OWN_IMAGES } from "@/lib/content/generated-images";
import { PageHeader } from "@/components/site/PageHeader";
import { LawyerCard } from "@/components/site/LawyerCard";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { Faq } from "@/components/landing/Sections";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

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

const H2 = "font-display text-[clamp(34px,3.6vw,56px)]";
const clean = (t: string) => t.replace(/\.$/, "");

export default async function EspecialidadPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [s, settings, lawyers, all] = await Promise.all([getSpecialtyBySlug(slug), getSettings(), getLawyers(slug), getSpecialties()]);
  if (!s) notFound();

  const detail = SPECIALTY_DETAILS[s.slug];
  const wa = whatsappUrl(settings.whatsapp_number, `Hola, quisiera orientación sobre ${s.name.toLowerCase()}.`);
  const requestHref = `/panel/nueva-solicitud?especialidad=${s.slug}`;
  const others = all.filter((o) => o.slug !== s.slug);
  const area = s.name.charAt(0).toLowerCase() + s.name.slice(1);
  const main = SPECIALTY_IMAGE[s.slug] ?? IMAGES.columnas;
  const pool = Object.values(IMAGES).filter((i) => i.src !== main.src);
  const idx = Math.max(0, all.findIndex((o) => o.slug === s.slug));
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

      <section aria-labelledby="descripcion" className="bg-carbon py-[var(--section-gap)]">
        <div className="frame grid gap-8 lg:grid-cols-12">
          <h2 id="descripcion" data-reveal className={`${H2} lg:col-span-4`}>
            Cómo trabajamos esta área
          </h2>
          <p data-reveal className="text-[clamp(19px,1.6vw,24px)] leading-[1.5] lg:col-span-7 lg:col-start-6">
            {s.description}
          </p>
        </div>
      </section>

      <figure data-reveal className="relative">
        <div className="duotone relative h-[44svh] lg:h-[60svh]">
          <Image src={band.src} alt={band.title} fill sizes="100vw" className="object-cover" />
        </div>
        <figcaption className="frame bg-carbon py-3 text-[14px]">{band.title}</figcaption>
      </figure>

      <section aria-labelledby="casos" className="bg-navy py-[var(--section-gap)]">
        <div className="frame grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="casos" data-reveal className={H2}>
              Casos que atendemos
            </h2>
            <ul className="mt-10 space-y-7">
              {s.problems.map((p) => (
                <li key={p} data-reveal className="text-[clamp(18px,1.4vw,21px)] leading-snug">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 data-reveal className={H2}>
              Servicios
            </h2>
            <ul className="mt-10 space-y-4">
              {s.services.map((sv) => (
                <li key={sv} data-reveal className="flex gap-4 text-[18px]">
                  <span aria-hidden className="mt-[0.55em] h-2 w-2 shrink-0 bg-mist" />
                  {clean(sv)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {detail ? (
        <>
          <section aria-labelledby="incluye" className="bg-carbon py-[var(--section-gap)]">
            <div className="frame grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h2 id="incluye" data-reveal className={H2}>
                  Qué incluye el acompañamiento
                </h2>
                <figure data-reveal className="duotone relative mt-10 hidden aspect-[4/5] max-w-[420px] lg:block">
                  <Image src={OWN_IMAGES.expediente.src} alt={OWN_IMAGES.expediente.title} fill sizes="30vw" className="object-cover" />
                </figure>
              </div>
              <ul className="flex flex-col gap-3 lg:col-span-6 lg:col-start-7 lg:self-center">
                {detail.included.map((it) => (
                  <li key={it} data-reveal className="bg-graphite px-6 py-5 text-[clamp(17px,1.3vw,20px)] leading-snug lg:px-8 lg:py-6">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="etapas" className="bg-graphite py-[var(--section-gap)]">
            <div className="frame">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                <h2 id="etapas" data-reveal className={`${H2} lg:col-span-6`}>
                  Cómo avanza un caso
                </h2>
                <p data-reveal className="max-w-[48ch] text-[17px] lg:col-span-5 lg:col-start-8">
                  Los tiempos son orientativos: dependen de la autoridad, del expediente y de la etapa en la que nos
                  consultes. En cada paso te explicamos qué sigue.
                </p>
              </div>
              <ol className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4 lg:gap-x-1">
                {detail.stages.map((st, i) => (
                  <li key={st.name} data-reveal className="flex gap-5 lg:flex-col lg:gap-0">
                    <span aria-hidden className={`w-1.5 shrink-0 lg:h-1.5 lg:w-full ${i === 0 ? "bg-mist" : "bg-steel"}`} />
                    <div className="lg:pr-8 lg:pt-8">
                      <h3 className="font-display text-[clamp(26px,2.2vw,34px)] leading-[1.02]">{st.name}</h3>
                      <p className="mt-2 text-[16px] font-medium text-mist">{st.time}</p>
                      <p className="mt-3 text-[16px] leading-relaxed">{st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section aria-labelledby="documentos" className="on-mist bg-mist py-[var(--section-gap)] text-navy">
            <div className="frame grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h2 id="documentos" data-reveal className={H2}>
                  Qué traer a la primera consulta
                </h2>
                <p data-reveal className="mt-6 max-w-[40ch] text-[17px]">
                  Si no tienes todos estos documentos, trae los que tengas: los revisamos juntos y te decimos qué falta.
                </p>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {detail.documents.map((d) => (
                    <li key={d} data-reveal className="flex gap-4 text-[17px] leading-snug">
                      <span aria-hidden className="mt-[0.2em] grid h-5 w-5 shrink-0 place-items-center bg-navy">
                        <span className="h-2 w-2 bg-mist" />
                      </span>
                      {clean(d)}
                    </li>
                  ))}
                </ul>
                <p data-reveal className="mt-12 bg-navy p-6 text-[17px] leading-relaxed text-white lg:p-8">
                  {detail.note}
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <section aria-labelledby="abogados-area" className="bg-carbon py-[var(--section-gap)]">
        <div className="frame">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="abogados-area" data-reveal className={H2}>
              Abogados en {area}
            </h2>
            {lawyers.length ? (
              <Link data-reveal href={`/abogados?especialidad=${s.slug}`} className="btn btn-ghost">
                Ver en el directorio <ArrowUpRight aria-hidden size={18} />
              </Link>
            ) : null}
          </div>
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
                <p className="text-[17px]">
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

      {s.faqs.length ? <Faq faqs={s.faqs} title="Preguntas frecuentes" /> : null}

      <section aria-labelledby="cta" className="on-mist bg-mist py-[var(--section-gap)] text-navy">
        <div className="frame grid gap-8 lg:grid-cols-12">
          <h2 id="cta" data-reveal className="font-display text-[clamp(40px,5vw,80px)] lg:col-span-7">
            ¿Te pasó algo así?
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

      {others.length ? (
        <nav aria-labelledby="otras" className="bg-carbon py-[var(--section-gap)]">
          <div className="frame">
            <h2 id="otras" data-reveal className={H2}>
              Otras especialidades
            </h2>
            <ul className="mt-10 grid gap-1 md:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug} data-reveal>
                  <Link
                    href={`/especialidades/${o.slug}`}
                    className="group flex min-h-[88px] items-center justify-between gap-6 bg-graphite px-6 py-5 transition-colors duration-200 hover:bg-navy lg:px-8"
                  >
                    <span className="font-display text-[clamp(24px,2.2vw,34px)] leading-[1.05]">{o.name}</span>
                    <ArrowUpRight
                      aria-hidden
                      size={22}
                      className="shrink-0 text-mist transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </>
  );
}
