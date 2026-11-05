import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/AuthForms";
import { ConfigNotice } from "@/components/auth/ConfigNotice";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default async function IngresarPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="font-display text-[clamp(44px,5vw,64px)]">Iniciar sesión</h1>
      <p className="mb-8 mt-3 text-[17px] text-ink-soft">Accede a tu panel para gestionar tus consultas jurídicas.</p>
      <ConfigNotice />
      {error === "enlace" ? (
        <p role="alert" className="mb-6 bg-danger-bg p-4 text-[15px]">El enlace no es válido o ya expiró. Solicita uno nuevo.</p>
      ) : null}
      <SignInForm next={next} />
      <p className="mt-8 text-[16px] text-ink-soft">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="link text-ink">Regístrate</Link>
      </p>
    </>
  );
}
