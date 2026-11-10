import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import type { SiteSettings, Specialty } from "@/lib/types";
import { IMAGES } from "@/lib/content/credits";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppFab";
import { MotionToggle } from "./MotionToggle";
import { FooterClose } from "./FooterClose";

const FIRM_LINKS = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/abogados", label: "Nuestros abogados" },
  { href: "/opiniones", label: "Opiniones" },
  { href: "/contacto", label: "Contacto" },
  { href: "/ingresar", label: "Iniciar sesión" },
];

/** Enlace del pie: subrayado que entra desde la izquierda al pasar el cursor. */
function FootLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls =
    "relative inline-block py-1 after:absolute after:bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-navy after:transition-transform after:duration-200 after:ease-[var(--ease-out)] hover:after:scale-x-100 focus-visible:after:scale-x-100";
  return external ? (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}

export function Footer({ settings, specialties }: { settings: SiteSettings; specialties: Specialty[] }) {
  const wa = whatsappUrl(settings.whatsapp_number, settings.whatsapp_message);
  const social = [
    { href: settings.instagram_url, label: "Instagram" },
    { href: settings.facebook_url, label: "Facebook" },
    { href: settings.linkedin_url, label: "LinkedIn" },
  ].filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer className="on-mist relative bg-mist text-navy">
      <div className="frame pb-6 pt-[var(--section-gap)]">
        {/* Cierre: la invitación a escribir, antes del directorio. */}
        <FooterClose>
        <div className="mb-[clamp(64px,8vw,120px)] grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-[clamp(44px,6.4vw,104px)] lg:col-span-8">¿Tienes un caso? Cuéntanoslo.</h2>
          <div className="flex flex-col gap-4 lg:col-span-4">
            <p className="max-w-[40ch] text-[17px]">
              La primera conversación sirve para entender tu situación y decirte con franqueza qué se puede hacer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/panel/nueva-solicitud" className="btn btn-primary">
                Solicitar asesoría <ArrowUpRight aria-hidden size={18} />
              </Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-carbon text-ink hover:bg-navy">
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
        </FooterClose>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-[16px] leading-relaxed md:grid-cols-4">
          <div>
            <h2 className="font-semibold">Visítenos</h2>
            <p className="mt-2">{settings.address || "Dirección por confirmar"}</p>
            <p>{settings.city}</p>
            <p>{settings.hours}</p>
          </div>
          <div>
            <h2 className="font-semibold">La firma</h2>
            <ul className="mt-1">
              {FIRM_LINKS.map((l) => (
                <li key={l.href}>
                  <FootLink href={l.href}>{l.label}</FootLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Especialidades</h2>
            <ul className="mt-1">
              {specialties.map((s) => (
                <li key={s.slug}>
                  <FootLink href={`/especialidades/${s.slug}`}>{s.short_name}</FootLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Contacto</h2>
            <ul className="mt-1">
              {settings.contact_email ? (
                <li>
                  <FootLink href={`mailto:${settings.contact_email}`}>
                    <span className="break-all">{settings.contact_email}</span>
                  </FootLink>
                </li>
              ) : null}
              {settings.contact_phone ? (
                <li>
                  <FootLink href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}>{settings.contact_phone}</FootLink>
                </li>
              ) : null}
              {wa ? (
                <li>
                  <FootLink href={wa} external>
                    WhatsApp
                  </FootLink>
                </li>
              ) : null}
              {social.map((s) => (
                <li key={s.label}>
                  <FootLink href={s.href} external>
                    {s.label}
                  </FootLink>
                </li>
              ))}
              <li>
                <FootLink href="/contacto">Formulario de contacto</FootLink>
              </li>
            </ul>
          </div>
        </div>

        {/* El nombre de la firma a todo el ancho: la firma al pie de la página. */}
        <div className="mt-[clamp(64px,8vw,120px)]">
          <svg viewBox="0 0 1000 150" className="block w-full" role="img" aria-label={settings.firm_name} preserveAspectRatio="xMinYMax meet">
            <text
              x="0"
              y="132"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="currentColor"
              style={{ fontFamily: "var(--font-display)", fontSize: 168, letterSpacing: "-0.03em" }}
            >
              {settings.firm_name}
            </text>
          </svg>
          <div className="mt-6 flex flex-col gap-4 bg-[color-mix(in_srgb,var(--mist)_82%,var(--white))] p-5 text-[15px] md:flex-row md:items-start md:justify-between">
            <p className="max-w-[90ch]">
              © {year} {settings.firm_name}. La información de este sitio es general y no sustituye una asesoría jurídica
              individual. <Link className="link" href="/legal/tratamiento-datos">Tratamiento de datos</Link> ·{" "}
              <Link className="link" href="/legal/privacidad">Aviso de privacidad</Link> ·{" "}
              <Link className="link" href="/legal/terminos">Términos y condiciones</Link>
            </p>
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 self-start">
              <MotionToggle className="link min-h-11 text-left font-medium" />
              <a href="#contenido" className="group inline-flex min-h-11 items-center gap-2 font-medium">
                Volver arriba
                <ArrowUp aria-hidden size={18} className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-snug">
            Fotografías:{" "}
            {Object.values(IMAGES).map((img, i, arr) => (
              <span key={img.src}>
                <a className="link" href={img.page} target="_blank" rel="noopener noreferrer">
                  “{img.title}”
                </a>{" "}
                por {img.author}, {img.license}, vía Wikimedia Commons{i < arr.length - 1 ? "; " : "."}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
