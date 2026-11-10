import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings, getSpecialties } from "@/lib/data";
import { ContactSection } from "@/components/landing/Sections";
import { OWN_IMAGES } from "@/lib/content/generated-images";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos o habla con un asesor por WhatsApp para recibir orientación inicial.",
  alternates: { canonical: "/contacto" },
};

const NEXT_STEPS = [
  { name: "Recibimos tu mensaje", text: "Tu mensaje llega al equipo de la firma. Lo que nos cuentas es confidencial." },
  { name: "Te contactamos", text: "Un asesor te escribe o te llama para entender mejor el caso y resolver tus primeras dudas." },
  { name: "Definimos el camino", text: "Si necesitas un abogado, te proponemos el área y el profesional, con alcance y honorarios por escrito." },
];

export default async function ContactoPage() {
  const [settings, specialties] = await Promise.all([getSettings(), getSpecialties()]);
  const place = OWN_IMAGES.candelariaLluvia;
  return (
    <>
      <div className="bg-graphite pt-24">
        <ContactSection settings={settings} specialties={specialties} waHref={whatsappUrl(settings.whatsapp_number, settings.whatsapp_message)} asPage />
      </div>

      <section aria-labelledby="despues" className="bg-carbon py-[var(--section-gap)]">
        <div className="frame">
          <h2 id="despues" data-reveal className="font-display text-[clamp(34px,3.6vw,56px)]">
            Qué pasa después de escribirnos
          </h2>
          <ol className="mt-12 grid gap-3 lg:grid-cols-3">
            {NEXT_STEPS.map((st, i) => (
              <li key={st.name} data-reveal className={`flex flex-col p-6 lg:p-10 ${i === 0 ? "bg-navy" : "bg-graphite"}`}>
                <h3 className="font-display text-[clamp(26px,2.2vw,34px)] leading-[1.02]">{st.name}</h3>
                <p className="mt-4 text-[17px] leading-relaxed">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="visitanos" className="bg-navy lg:grid lg:grid-cols-12">
        <figure className="relative lg:col-span-6">
          <div className="duotone relative aspect-[4/5] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
            <Image src={place.src} alt={place.title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="frame relative z-[1] bg-carbon py-3 text-[14px] lg:absolute lg:bottom-0 lg:left-0 lg:px-5">{place.title}</figcaption>
        </figure>
        <div className="frame py-[var(--section-gap)] lg:col-span-5 lg:col-start-8">
          <h2 id="visitanos" data-reveal className="font-display text-[clamp(40px,5vw,80px)]">
            Visítanos
          </h2>
          <dl className="mt-10 grid gap-8 text-[17px]">
            <div data-reveal>
              <dt className="font-semibold">Dirección</dt>
              <dd className="mt-1">
                {settings.address || "Dirección por confirmar"}
                <br />
                {settings.city}
              </dd>
            </div>
            <div data-reveal>
              <dt className="font-semibold">Horario de atención</dt>
              <dd className="mt-1">{settings.hours}</dd>
            </div>
            {settings.contact_email || settings.contact_phone ? (
              <div data-reveal>
                <dt className="font-semibold">Correo y teléfono</dt>
                <dd className="mt-1 flex flex-col">
                  {settings.contact_email ? (
                    <a className="link break-all" href={`mailto:${settings.contact_email}`}>
                      {settings.contact_email}
                    </a>
                  ) : null}
                  {settings.contact_phone ? (
                    <a className="link" href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}>
                      {settings.contact_phone}
                    </a>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
          <p data-reveal className="mt-10 max-w-[44ch] text-[17px]">
            Te recomendamos escribirnos antes de venir, para que el abogado del área te reciba con tu caso revisado.
          </p>
          <div data-reveal className="mt-6 flex flex-wrap gap-3">
            <Link href="/especialidades" className="btn btn-primary">
              Ver especialidades
            </Link>
            <Link href="/legal/tratamiento-datos" className="btn bg-carbon text-ink hover:bg-graphite">
              Cómo tratamos tus datos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
