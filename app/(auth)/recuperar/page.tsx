import type { Metadata } from "next";
import Link from "next/link";
import { ResetRequestForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <>
      <h1 className="font-display text-[clamp(44px,5vw,64px)]">Recuperar contraseña</h1>
      <p className="mb-8 mt-3 text-[17px] text-ink-soft">Te enviaremos un enlace para crear una nueva contraseña.</p>
      <ResetRequestForm />
      <p className="mt-8 text-[16px] text-ink-soft">
        <Link href="/ingresar" className="link text-ink">Volver a iniciar sesión</Link>
      </p>
    </>
  );
}
