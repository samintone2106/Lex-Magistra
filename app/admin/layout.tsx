import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell, type ShellGroup } from "@/components/panel/Shell";
import { Notice } from "@/components/ui/States";
import { getAdminStats } from "@/components/admin/stats";
import { getSession, getSettings } from "@/lib/data";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Administración", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (!session) redirect("/ingresar?next=/admin");
  if (session.profile.role !== "admin") redirect("/panel");
  const { stats } = await getAdminStats();

  const groups: ShellGroup[] = [
    {
      links: [{ href: "/admin", label: "Resumen", icon: "stats", exact: true }],
    },
    {
      label: "Por atender",
      links: [
        { href: "/admin/solicitudes", label: "Solicitudes", icon: "requests", count: stats?.requests_open, countLabel: "solicitudes abiertas" },
        { href: "/admin/resenas", label: "Reseñas", icon: "reviews", count: stats?.reviews_pending, countLabel: "reseñas por moderar" },
        { href: "/admin/mensajes", label: "Mensajes de contacto", icon: "messages", count: stats?.messages_open, countLabel: "mensajes sin atender" },
      ],
    },
    {
      label: "Directorio",
      links: [
        { href: "/admin/abogados", label: "Abogados", icon: "lawyers" },
        { href: "/admin/firmas", label: "Firmas", icon: "firms" },
        { href: "/admin/especialidades", label: "Especialidades", icon: "inbox" },
        { href: "/admin/usuarios", label: "Usuarios y roles", icon: "users" },
      ],
    },
    {
      label: "Sitio",
      links: [
        { href: "/admin/configuracion", label: "Configuración y contenido", icon: "settings" },
        { href: "/panel", label: "Mi panel de cliente", icon: "home", exact: true },
      ],
    },
  ];

  return (
    <Shell
      scope="Administración"
      firmName={settings.firm_name}
      user={{ name: session.profile.full_name || session.email, email: session.email, role: ROLE_LABEL[session.profile.role], avatarUrl: session.profile.avatar_url }}
      groups={groups}
    >
      {settings.whatsapp_number ? null : (
        <Notice
          tone="warning"
          className="mb-6"
          action={
            <Link href="/admin/configuracion" className="link text-[14px] text-ink">
              Configurarlo
            </Link>
          }
        >
          El número de WhatsApp no está configurado, así que el botón flotante del sitio está oculto.
        </Notice>
      )}
      {children}
    </Shell>
  );
}
