import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar, uploadOwnLawyerPhoto } from "@/lib/actions/uploads";
import { PanelTitle } from "@/components/panel/Shell";
import { ProfileForm } from "@/components/panel/ProfileForm";
import { ImageDrop } from "@/components/ui/ImageDrop";
import { initialsOf } from "@/components/ui/Panel";
import { isOwnPublicUrl } from "@/lib/storage-url";
import { AVATAR_MAX, LAWYER_PHOTO_MAX } from "@/lib/validation";
import { ROLE_LABEL } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

/** Ajustes de la cuenta: cada sección es una fila (explicación a la izquierda, panel a la derecha). */
export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/ingresar");
  const p = session.profile;
  // Solo el abogado vinculado a un perfil público puede cambiar su foto del sitio.
  const lawyer =
    p.role === "lawyer"
      ? (await (await createClient()).from("lawyers").select("id,photo_url,is_active").eq("profile_id", p.id).maybeSingle()).data
      : null;
  const initials = <span className="font-display text-[44px] text-mist">{initialsOf(p.full_name || session.email)}</span>;

  return (
    <>
      <PanelTitle title="Mi perfil" lead={`${ROLE_LABEL[p.role]} desde el ${fmt.format(new Date(p.created_at))}. Mantén tus datos al día para que el equipo pueda contactarte.`} />

      <div className="grid gap-10">
        <section aria-labelledby="foto" className="grid gap-6 lg:grid-cols-[300px_minmax(0,720px)] lg:gap-10">
          <div>
            <h2 id="foto" className="text-[16px] font-semibold">
              Foto de tu cuenta
            </h2>
            <p className="mt-1 text-[14px] text-ink-soft">
              Se ve en tu panel y ayuda al equipo a reconocerte. No es obligatoria: si no subes una, mostramos tus iniciales.
            </p>
          </div>
          <div className="bg-graphite p-5 sm:p-6">
            <ImageDrop
              label="Foto de perfil"
              aspect={1}
              width={160}
              maxBytes={AVATAR_MAX}
              action={uploadAvatar}
              currentUrl={isOwnPublicUrl(p.avatar_url, "avatars") ? p.avatar_url : null}
              fallback={initials}
              hint="JPG, PNG o WEBP. Se recorta en cuadrado y se reduce automáticamente; el archivo final pesa menos de 2 MB."
            />
          </div>
        </section>

        {lawyer ? (
          <section aria-labelledby="foto-publica" className="grid gap-6 border-t border-white/[0.06] pt-10 lg:grid-cols-[300px_minmax(0,720px)] lg:gap-10">
            <div>
              <h2 id="foto-publica" className="text-[16px] font-semibold">
                Foto pública de tu perfil
              </h2>
              <p className="mt-1 text-[14px] text-ink-soft">
                Es la que ven los clientes en el directorio de abogados y en tu página{lawyer.is_active ? "" : " (cuando la firma publique tu perfil)"}. Usa un retrato
                vertical, de frente y con fondo neutro; en el sitio se muestra en blanco y negro.
              </p>
            </div>
            <div className="bg-graphite p-5 sm:p-6">
              <ImageDrop
                label="Retrato profesional"
                aspect={0.8}
                width={176}
                grayscale
                maxBytes={LAWYER_PHOTO_MAX}
                action={uploadOwnLawyerPhoto}
                currentUrl={lawyer.photo_url}
                fallback="Sin foto: el sitio muestra tus iniciales"
                hint="JPG, PNG o WEBP. Se recorta en retrato 4:5; arrastra la imagen para que tu cara quede centrada."
              />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="datos" className="grid gap-6 border-t border-white/[0.06] pt-10 lg:grid-cols-[300px_minmax(0,720px)] lg:gap-10">
          <div>
            <h2 id="datos" className="text-[16px] font-semibold">
              Datos personales y de contacto
            </h2>
            <p className="mt-1 text-[14px] text-ink-soft">
              El abogado los usa para contactarte y para preparar la propuesta de servicios. Solo los ve el equipo de la firma.
            </p>
          </div>
          <div className="bg-graphite p-5 sm:p-6">
            <ProfileForm profile={p} email={session.email} />
          </div>
        </section>

        <section aria-labelledby="seguridad" className="grid gap-6 border-t border-white/[0.06] pt-10 lg:grid-cols-[300px_minmax(0,720px)] lg:gap-10">
          <div>
            <h2 id="seguridad" className="text-[16px] font-semibold">
              Seguridad y privacidad
            </h2>
            <p className="mt-1 text-[14px] text-ink-soft">Tu contraseña y tus derechos sobre los datos que nos entregaste.</p>
          </div>
          <ul className="grid gap-px bg-white/[0.06]">
            <li className="flex flex-wrap items-center justify-between gap-4 bg-graphite p-5">
              <div className="flex items-start gap-3">
                <KeyRound aria-hidden size={18} className="mt-0.5 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[15px] font-medium">Contraseña</p>
                  <p className="text-[14px] text-ink-soft">Te enviamos un enlace al correo para crear una nueva.</p>
                </div>
              </div>
              <Link href="/recuperar" className="btn btn-secondary bg-navy hover:bg-carbon">
                Cambiar contraseña
              </Link>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-4 bg-graphite p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck aria-hidden size={18} className="mt-0.5 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[15px] font-medium">Tus datos personales</p>
                  <p className="max-w-[52ch] text-[14px] text-ink-soft">
                    Según la Ley 1581 de 2012 puedes conocer, actualizar, rectificar o pedir que eliminemos tus datos.
                  </p>
                </div>
              </div>
              <Link href="/legal/tratamiento-datos" className="btn btn-ghost">
                Ver la política
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
