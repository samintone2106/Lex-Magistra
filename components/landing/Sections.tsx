import Image from "next/image";
import Link from "next/link";
import type { LawyerWithRelations, Review, SiteSettings, Specialty } from "@/lib/types";
import { IMAGES } from "@/lib/content/credits";
import { LawyerCard } from "@/components/site/LawyerCard";
import { Stars } from "@/components/site/Stars";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ContactForm } from "./ContactForm";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { Counter } from "./Counter";

/* ───────── Presentación de la firma: título, nota y fila de hechos ───────── */
export function Intro({ settings, specialtiesCount }: { settings: SiteSettings; specialtiesCount: number }) {
  const facts = [
    { value: specialtiesCount, label: "áreas del derecho bajo un mismo equipo", counter: true },
    { value: "Colombia", label: "atención presencial y virtual en todo el país" },
    { value: "Por escrito", label: "alcance y honorarios acordados antes de empezar" },
    { value: "Reservado", label: "lo que nos cuentas queda bajo secreto profesional" },
  ];
  return (
    <section aria-labelledby="firma-title" className="bg-carbon pb-[120px] pt-[var(--section-gap)]">
      <div className="frame grid gap-8 lg:grid-cols-12">
        <SplitHeading id="firma-title" className="font-display text-[clamp(44px,5.4vw,88px)] lg:col-span-6">
          Una firma, seis frentes
        </SplitHeading>
        <p data-reveal className="max-w-[46ch] text-[17px] text-ink lg:col-span-4 lg:col-start-9 lg:self-end">
          {settings.about_text}
        </p>
      </div>
      <dl className="frame mt-[120px] grid grid-cols-2 gap-x-6 gap-y-10 lg:flex lg:justify-between">
        {facts.map((f) => (
          <div key={f.label} data-reveal className="max-w-[24ch]">
            <dt className="font-display text-[clamp(32px,3.4vw,52px)] leading-none">
              {f.counter ? <Counter to={Number(f.value)} /> : f.value}
            </dt>
            <dd className="mt-2 text-[15px] text-ink-soft">{f.label}</dd>
          </div>
        ))}
      </dl>
      <div className="frame mt-[120px] grid gap-6 lg:grid-cols-12">
        <figure data-media className="duotone relative aspect-[16/9] lg:col-span-8">
          <Image src="/img/biblioteca.jpg" alt="Estantería con libros antiguos de derecho" fill sizes="(min-width:1024px) 66vw, 100vw" quality={70} className="object-cover" />
        </figure>
        <figure data-media className="duotone relative hidden aspect-[3/4] lg:col-span-4 lg:block">
          <Image src={IMAGES.escalera.src} alt="Escalera de mármol en el vestíbulo de un tribunal" fill sizes="33vw" className="object-cover" />
        </figure>
      </div>
    </section>
  );
}

/* ───────── Equipo ───────── */
export function Team({ lawyers }: { lawyers: LawyerWithRelations[] }) {
  return (
    <section aria-labelledby="equipo-title" className="bg-carbon py-[var(--section-gap)]">
      <div className="frame grid gap-6 lg:grid-cols-12">
        <SplitHeading id="equipo-title" className="font-display text-[clamp(44px,5vw,80px)] lg:col-span-6">
          Nuestro equipo de abogados
        </SplitHeading>
        <div data-reveal className="flex flex-col items-start gap-5 lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="text-[17px] text-ink-soft">
            Cada perfil muestra la formación, la experiencia y las áreas de trabajo de quien llevaría tu caso.
          </p>
          <Link href="/abogados" className="btn btn-secondary">
            Ver todos los abogados
          </Link>
        </div>
      </div>
      {lawyers.length ? (
        <div className="frame mt-16 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {lawyers.slice(0, 4).map((l) => (
            <LawyerCard key={l.id} lawyer={l} />
          ))}
        </div>
      ) : (
        <div data-reveal className="frame mt-16 grid gap-6 lg:grid-cols-12">
          <figure className="duotone relative aspect-[16/10] lg:col-span-7">
            <Image src={IMAGES.palacio.src} alt="Fachada del Palacio de Justicia de Colombia" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
          </figure>
          <div className="flex flex-col justify-end gap-4 bg-graphite p-8 lg:col-span-5">
            <p className="font-display text-[clamp(30px,3vw,44px)] leading-none">Equipo en incorporación</p>
            <p className="text-[17px] text-ink-soft">
              Estamos publicando los perfiles de nuestros abogados. Mientras tanto, cuéntanos tu caso y lo
              asignaremos al profesional del área que corresponda.
            </p>
            <Link href="/panel/nueva-solicitud" className="btn btn-primary self-start">
              Solicitar asesoría
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────── ¿Por qué elegirnos? (columnas de nombres; al pasar el cursor, la explicación) ───────── */
const REASONS = [
  {
    group: "Método",
    items: [
      ["Escuchamos el caso completo", "Antes de opinar, entendemos los hechos, los documentos y lo que esperas."],
      ["Estrategia antes de actuar", "Cada actuación responde a un plan definido contigo."],
      ["Lenguaje claro", "Te explicamos el derecho sin tecnicismos innecesarios."],
      ["Un área para cada asunto", "Tu caso lo revisa quien trabaja esa materia todos los días."],
    ],
    sum: "Entendemos primero, actuamos después.",
  },
  {
    group: "Confianza",
    items: [
      ["Secreto profesional", "Lo que nos cuentas está protegido por el secreto profesional del abogado."],
      ["Honorarios por escrito", "Sabes qué incluye el servicio y cuánto cuesta antes de empezar."],
      ["Sin promesas de resultado", "Decimos con franqueza qué es posible; el resultado depende de la autoridad."],
      ["Datos protegidos", "Tratamos tu información conforme a la Ley 1581 de 2012."],
    ],
    sum: "Franqueza, reserva y acuerdos claros.",
  },
  {
    group: "Cercanía",
    items: [
      ["WhatsApp como primer paso", "Una orientación inicial por el canal que ya usas."],
      ["Panel propio", "Consultas el estado y el historial de tus solicitudes en línea."],
      ["Atención virtual y presencial", "Te atendemos donde estés en Colombia."],
      ["Un solo interlocutor", "Sabes siempre quién lleva tu asunto."],
    ],
    sum: "Siempre sabes en qué va tu caso.",
  },
];

export function WhyUs() {
  return (
    <section aria-labelledby="porque-title" className="bg-graphite py-[var(--section-gap)]">
      <div className="frame">
        <SplitHeading id="porque-title" className="font-display text-[clamp(40px,4.4vw,68px)]">
          ¿Por qué elegirnos?
        </SplitHeading>
      </div>
      <div className="frame mt-16 grid gap-12 lg:grid-cols-12 lg:gap-6">
        {REASONS.map((r) => (
          <div key={r.group} data-reveal className="lg:col-span-4">
            <h3 className="text-[20px] font-semibold text-ink">{r.group}</h3>
            <ul className="mt-6 space-y-5">
              {r.items.map(([name, desc]) => (
                <li key={name} className="group">
                  <p className="text-[19px] leading-snug text-ink transition-colors duration-300">{name}</p>
                  <p className="mt-1 text-[16px] leading-snug text-ink-soft">{desc}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[16px] italic text-mist">{r.sum}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── Opiniones: una voz grande, dos en las esquinas ───────── */
export function ReviewsSection({ reviews }: { reviews: (Review & { lawyerName?: string })[] }) {
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const [lead, ...rest] = reviews;
  const author = (r: Review) => (r.show_name ? r.public_name : "Cliente verificado");

  return (
    <section aria-labelledby="opiniones-title" className={`grid grid-rows-[auto_1fr_auto] bg-navy py-20 ${reviews.length ? "min-h-[100svh]" : ""}`}>
      <div className="frame flex flex-wrap items-end justify-between gap-6">
        <SplitHeading id="opiniones-title" className="font-display text-[clamp(40px,4.4vw,68px)]">
          Opiniones de clientes
        </SplitHeading>
        {reviews.length ? (
          <p data-reveal className="flex items-center gap-3 text-[17px]">
            <Stars value={avg} /> {avg.toFixed(1)} de 5 · {reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"}
          </p>
        ) : null}
      </div>

      {lead ? (
        <>
          <figure className="frame flex items-center justify-center py-16">
            <div data-reveal className="max-w-[60ch] text-center">
              <Stars value={lead.rating} size={22} />
              <blockquote className="font-display mt-6 text-[clamp(26px,2.6vw,36px)] leading-[1.15]">“{lead.comment}”</blockquote>
              <figcaption className="mt-6 text-[16px] text-ink-soft">{author(lead)}</figcaption>
            </div>
          </figure>
          <div className="frame grid gap-10 md:grid-cols-12">
            {rest.slice(0, 2).map((r, i) => (
              <figure key={r.id} data-reveal className={`md:col-span-3 ${i === 1 ? "md:col-start-10" : ""}`}>
                <Stars value={r.rating} size={16} />
                <blockquote className="mt-3 text-[16px] leading-relaxed">“{r.comment}”</blockquote>
                <figcaption className="mt-3 text-[15px] text-ink-soft">{author(r)}</figcaption>
              </figure>
            ))}
            <div className="md:col-span-12">
              <Link href="/opiniones" className="btn btn-secondary">
                Ver todas las opiniones
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="frame flex items-center justify-center py-12">
            <p data-reveal className="font-display max-w-[30ch] text-center text-[clamp(24px,2.6vw,36px)] leading-[1.15]">
              Las opiniones de nuestros clientes aparecerán aquí, tal como ellos las escriban.
            </p>
          </div>
          <div className="frame flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <p data-reveal className="max-w-[48ch] text-[16px] text-ink-soft">
              Solo publicamos reseñas de usuarios registrados, después de revisar que no contengan datos sensibles.
              No escribimos ni compramos opiniones.
            </p>
            <Link data-reveal href="/panel/resenas/nueva" className="btn btn-primary">
              Escribir una opinión
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

/* ───────── Preguntas frecuentes: preguntas grandes, respuestas al lado ───────── */
export const GENERAL_FAQS = [
  {
    q: "¿La primera orientación tiene costo?",
    a: "La orientación inicial por WhatsApp o por el formulario sirve para entender tu caso y decirte qué área lo atiende. Si el asunto requiere un servicio, recibirás una propuesta por escrito con los honorarios antes de empezar.",
  },
  {
    q: "¿Elegir un abogado en la plataforma me obliga a contratarlo?",
    a: "No. Seleccionar un abogado y enviar una solicitud no crea una relación abogado-cliente ni un contrato. Esa relación empieza solo cuando apruebas una propuesta de servicios.",
  },
  {
    q: "¿Mi información es confidencial?",
    a: "Sí. La información de tu caso solo la ven tú, el equipo jurídico asignado y la administración de la firma, y está protegida por el secreto profesional y por la Ley 1581 de 2012.",
  },
  {
    q: "¿Pueden garantizar el resultado de mi caso?",
    a: "No. Ningún abogado puede garantizar una decisión judicial o administrativa. Nos comprometemos con un trabajo diligente, técnico y transparente.",
  },
  {
    q: "¿Atienden fuera de Bogotá?",
    a: "Sí. Atendemos de forma virtual en todo el país y presencial cuando el caso lo requiere.",
  },
  {
    q: "¿Cómo consulto el estado de mi solicitud?",
    a: "Desde tu panel privado, en la sección Mis solicitudes, ves el estado actual y el historial de cambios.",
  },
];

export function Faq({ faqs = GENERAL_FAQS, title = "Preguntas frecuentes" }: { faqs?: { q: string; a: string }[]; title?: string }) {
  return (
    <section aria-labelledby="faq-title" className="bg-carbon py-[var(--section-gap)]">
      <div className="frame">
        <h2 id="faq-title" data-reveal className="font-display text-[clamp(32px,3vw,48px)] text-ink-soft">
          {title}
        </h2>
        <dl className="mt-14 space-y-[72px]">
          {faqs.map((f) => (
            <div key={f.q} data-reveal className="grid gap-3 lg:grid-cols-12 lg:gap-6">
              <dt className="font-display text-[clamp(26px,2.6vw,40px)] leading-[1.08] lg:col-span-6">{f.q}</dt>
              <dd className="max-w-[44ch] text-[17px] leading-relaxed text-ink-soft lg:col-span-5 lg:col-start-8 lg:pt-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ───────── Contacto ───────── */
export function ContactSection({ settings, specialties, waHref, asPage = false }: { settings: SiteSettings; specialties: Specialty[]; waHref: string | null; asPage?: boolean }) {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="bg-graphite py-[var(--section-gap)]">
      <div className="frame grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SplitHeading as={asPage ? "h1" : "h2"} trigger={asPage ? "load" : "scroll"} id="contacto-title" className="font-display text-[clamp(44px,5vw,80px)]">
            Cuéntanos tu caso
          </SplitHeading>
          <p data-reveal className="mt-6 max-w-[40ch] text-[17px] text-ink-soft">
            Escríbenos y un asesor te responderá. Si prefieres una respuesta inmediata, nuestro canal de WhatsApp
            es la forma más rápida de recibir orientación inicial.
          </p>
          <div data-reveal className="mt-10 space-y-2 text-[17px]">
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <WhatsAppIcon className="h-5 w-5" /> Escribir por WhatsApp
              </a>
            ) : null}
            {settings.contact_email ? (
              <p className="pt-4">
                <a className="link" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </p>
            ) : null}
            {settings.contact_phone ? <p>{settings.contact_phone}</p> : null}
            <p className="text-ink-soft">{settings.hours}</p>
          </div>
        </div>
        <div data-reveal className="lg:col-span-6 lg:col-start-7">
          <ContactForm specialties={specialties} />
        </div>
      </div>
    </section>
  );
}
