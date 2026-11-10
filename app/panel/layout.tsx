import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell, type ShellGroup } from "@/components/panel/Shell";
import { getSession, getSettings } from "@/lib/data";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mi panel", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (!session) redirect("/ingresar?next=/panel");
  const wa = whatsappUrl(settings.whatsapp_number, "Hola, escribo desde mi panel de cliente.");
  const role = session.profile.role;

  const groups: ShellGroup[] = [
    {
      links: [
        { href: "/panel", label: "Resumen", icon: "home", exact: true },
        { href: "/panel/nueva-solicitud", label: "Nueva solicitud", icon: "new" },
        { href: "/panel/solicitudes", label: "Mis solicitudes", icon: "requests" },
      ],
    },
    {
      label: "La firma",
      links: [
        { href: "/panel/abogados", label: "Explorar abogados", icon: "lawyers" },
        { href: "/panel/resenas/nueva", label: "Opiniones", icon: "reviews" },
      ],
    },
    {
      label: "Cuenta",
      links: [
        { href: "/panel/perfil", label: "Mi perfil", icon: "profile" },
        ...(role === "lawyer" ? [{ href: "/panel/asignadas", label: "Casos asignados", icon: "assigned" as const }] : []),
        ...(role === "admin" ? [{ href: "/admin", label: "Panel administrativo", icon: "admin" as const }] : []),
      ],
    },
  ];

  return (
    <Shell
      scope="Panel de cliente"
      firmName={settings.firm_name}
      user={{ name: session.profile.full_name || session.email, email: session.email, role: ROLE_LABEL[role], avatarUrl: session.profile.avatar_url }}
      groups={groups}
      extra={
        wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 flex min-h-11 items-center gap-3 border border-white/[0.08] px-3 text-[14px] text-ink transition-colors duration-150 hover:bg-white/[0.04]"
          >
            <WhatsAppIcon className="h-4 w-4 text-wa" />
            <span className="flex-1">Escribir por WhatsApp</span>
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        ) : null
      }
    >
      {children}
    </Shell>
  );
}
