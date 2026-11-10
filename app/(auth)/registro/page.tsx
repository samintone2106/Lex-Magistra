import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/AuthForms";
import { ConfigNotice } from "@/components/auth/ConfigNotice";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function RegistroPage() {
  return (
    <>
      <h1 className="font-display text-[40px] leading-[1.02] sm:text-[44px]">Crear cuenta</h1>
      <p className="mb-8 mt-3 text-[16px] text-ink-soft">
        Con tu cuenta solicitas asesoría, eliges abogado y sigues el estado de tus solicitudes. No tiene costo.
      </p>
      <ConfigNotice />
      <SignUpForm />
      <p className="mt-8 border-t border-white/[0.07] pt-6 text-[15px] text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingresar" className="link text-ink">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
