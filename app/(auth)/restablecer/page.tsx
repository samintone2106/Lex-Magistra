import type { Metadata } from "next";
import Link from "next/link";
import { NewPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };

export default function RestablecerPage() {
  return (
    <>
      <h1 className="font-display text-[40px] leading-[1.02] sm:text-[44px]">Nueva contraseña</h1>
      <p className="mb-8 mt-3 text-[16px] text-ink-soft">Elige una contraseña que no uses en otros sitios. Al guardarla entrarás directo a tu panel.</p>
      <NewPasswordForm />
      <p className="mt-8 border-t border-white/[0.07] pt-6 text-[15px] text-ink-soft">
        ¿El enlace venció?{" "}
        <Link href="/recuperar" className="link text-ink">
          Solicita uno nuevo
        </Link>
      </p>
    </>
  );
}
