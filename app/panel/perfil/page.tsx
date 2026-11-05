import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { ProfileForm } from "@/components/panel/ProfileForm";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/ingresar");
  return (
    <>
      <PanelTitle title="Mi perfil" lead="Mantén tus datos al día para que el equipo pueda contactarte." />
      <ProfileForm profile={session.profile} email={session.email} />
      <div className="mt-12 max-w-[640px] bg-graphite p-6 text-[15px] text-ink-soft">
        <p>
          ¿Quieres cambiar tu contraseña? <Link href="/recuperar" className="link text-ink">Solicita un enlace</Link>.
        </p>
        <p className="mt-2">
          Para conocer, actualizar o suprimir tus datos consulta la{" "}
          <Link href="/legal/tratamiento-datos" className="link text-ink">política de tratamiento de datos</Link>.
        </p>
      </div>
    </>
  );
}
