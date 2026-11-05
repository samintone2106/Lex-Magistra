import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/AuthForms";
import { ConfigNotice } from "@/components/auth/ConfigNotice";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function RegistroPage() {
  return (
    <>
      <h1 className="font-display text-[clamp(44px,5vw,64px)]">Crear cuenta</h1>
      <p className="mb-8 mt-3 text-[17px] text-ink-soft">
        Con tu cuenta puedes solicitar asesoría, elegir abogado y seguir el estado de tus solicitudes.
      </p>
      <ConfigNotice />
      <SignUpForm />
      <p className="mt-8 text-[16px] text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingresar" className="link text-ink">Inicia sesión</Link>
      </p>
    </>
  );
}
