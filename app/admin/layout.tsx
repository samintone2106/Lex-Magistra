import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/panel/Shell";
import { getSession, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Administración", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (!session) redirect("/ingresar?next=/admin");
  if (session.profile.role !== "admin") redirect("/panel");

  const links = [
    { href: "/admin", label: "Estadísticas", exact: true },
    { href: "/admin/solicitudes", label: "Solicitudes" },
    { href: "/admin/abogados", label: "Abogados" },
    { href: "/admin/firmas", label: "Firmas" },
    { href: "/admin/especialidades", label: "Especialidades" },
    { href: "/admin/usuarios", label: "Usuarios y roles" },
    { href: "/admin/resenas", label: "Reseñas" },
    { href: "/admin/mensajes", label: "Mensajes de contacto" },
    { href: "/admin/configuracion", label: "Configuración y contenido" },
    { href: "/panel", label: "Mi panel de cliente", exact: true },
  ];

  return (
    <Shell title="Panel administrativo" firmName={settings.firm_name} userName={session.profile.full_name || session.email} links={links}>
      {settings.whatsapp_number ? null : (
        <p role="status" className="mb-8 bg-danger-bg p-4 text-[15px]">
          El número de WhatsApp no está configurado: el botón flotante está oculto.{" "}
          <Link href="/admin/configuracion" className="link">Configurarlo</Link>
        </p>
      )}
      {children}
    </Shell>
  );
}
