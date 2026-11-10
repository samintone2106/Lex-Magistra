import type { Metadata } from "next";
import Link from "next/link";
import { ResetRequestForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <>
      <h1 className="font-display text-[40px] leading-[1.02] sm:text-[44px]">Recuperar contraseña</h1>
      <p className="mb-8 mt-3 text-[16px] text-ink-soft">
        Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva. Por seguridad no confirmamos si el correo está registrado.
      </p>
      <ResetRequestForm />
      <p className="mt-8 border-t border-white/[0.07] pt-6 text-[15px] text-ink-soft">
        ¿La recordaste?{" "}
        <Link href="/ingresar" className="link text-ink">
          Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}
