import Link from "next/link";
import type { SiteSettings, Specialty } from "@/lib/types";
import { IMAGES } from "@/lib/content/credits";
import { whatsappUrl } from "@/lib/whatsapp";

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
      <div className="frame grid min-h-[100svh] grid-rows-[auto_1fr_auto] pb-6 pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-[16px] leading-relaxed md:grid-cols-4">
          <div>
            <h2 className="font-semibold">Visítenos</h2>
            <p>{settings.address || "Dirección por confirmar"}</p>
            <p>{settings.city}</p>
            <p>{settings.hours}</p>
          </div>
          <div>
            <h2 className="font-semibold">La firma</h2>
            <ul>
              <li><Link className="link" href="/nosotros">Nosotros</Link></li>
              <li><Link className="link" href="/abogados">Nuestros abogados</Link></li>
              <li><Link className="link" href="/opiniones">Opiniones</Link></li>
              <li><Link className="link" href="/contacto">Contacto</Link></li>
              <li><Link className="link" href="/ingresar">Iniciar sesión</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Especialidades</h2>
            <ul>
              {specialties.map((s) => (
                <li key={s.slug}>
                  <Link className="link" href={`/especialidades/${s.slug}`}>
                    {s.short_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Contacto</h2>
            <ul>
              {settings.contact_email ? (
                <li><a className="link" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>
              ) : null}
              {settings.contact_phone ? (
                <li><a className="link" href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}>{settings.contact_phone}</a></li>
              ) : null}
              {wa ? (
                <li><a className="link" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              ) : null}
              {social.map((s) => (
                <li key={s.label}>
                  <a className="link" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
              <li><Link className="link" href="/contacto">Formulario de contacto</Link></li>
            </ul>
          </div>
        </div>

        <div aria-hidden />

        <div>
          <svg
            viewBox="0 0 1000 150"
            className="block w-full"
            role="img"
            aria-label={settings.firm_name}
            preserveAspectRatio="xMinYMax meet"
          >
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
          <div className="mt-5 flex flex-col gap-3 text-[14px] md:flex-row md:items-end md:justify-between">
            <p>
              © {year} {settings.firm_name}. La información de este sitio es general y no sustituye una asesoría
              jurídica individual.{" "}
              <Link className="link" href="/legal/tratamiento-datos">Tratamiento de datos</Link> ·{" "}
              <Link className="link" href="/legal/privacidad">Aviso de privacidad</Link> ·{" "}
              <Link className="link" href="/legal/terminos">Términos y condiciones</Link>
            </p>
          </div>
          <p className="mt-3 text-[13px] leading-snug">
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
