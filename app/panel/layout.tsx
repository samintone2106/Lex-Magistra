import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell } from "@/components/panel/Shell";
import { getSession, getSettings } from "@/lib/data";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mi panel", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (!session) redirect("/ingresar?next=/panel");
  const wa = whatsappUrl(settings.whatsapp_number, "Hola, escribo desde mi panel de cliente.");

  const links = [
    { href: "/panel", label: "Resumen", exact: true },
    { href: "/panel/nueva-solicitud", label: "Nueva solicitud" },
    { href: "/panel/solicitudes", label: "Mis solicitudes" },
    { href: "/panel/abogados", label: "Explorar abogados" },
    { href: "/panel/resenas/nueva", label: "Opiniones" },
    { href: "/panel/perfil", label: "Mi perfil" },
    ...(session.profile.role === "lawyer" ? [{ href: "/panel/asignadas", label: "Casos asignados" }] : []),
    ...(session.profile.role === "admin" ? [{ href: "/admin", label: "Ir al panel administrativo" }] : []),
  ];

  return (
    <Shell
      title="Panel de cliente"
      firmName={settings.firm_name}
      userName={session.profile.full_name || session.email}
      links={links}
      extra={
        wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-11 items-center gap-2 bg-wa px-3 text-[15px] font-medium text-carbon">
            <WhatsAppIcon className="h-5 w-5" /> Escribir por WhatsApp
          </a>
        ) : null
      }
    >
      {children}
    </Shell>
  );
}
