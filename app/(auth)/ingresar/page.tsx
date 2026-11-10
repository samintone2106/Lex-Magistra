import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/AuthForms";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Notice } from "@/components/ui/States";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default async function IngresarPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="font-display text-[40px] leading-[1.02] sm:text-[44px]">Iniciar sesión</h1>
      <p className="mb-8 mt-3 text-[16px] text-ink-soft">Entra a tu panel para ver en qué va cada solicitud y escribirle al equipo.</p>
      <ConfigNotice />
      {error === "enlace" ? (
        <Notice tone="danger" className="mb-6">
          El enlace no es válido o ya venció. <Link href="/recuperar" className="link">Solicita uno nuevo</Link>.
        </Notice>
      ) : null}
      {next && next !== "/panel" ? (
        <Notice tone="info" className="mb-6">
          Inicia sesión para continuar. Te llevaremos a la página que estabas abriendo.
        </Notice>
      ) : null}
      <SignInForm next={next} />
      <p className="mt-8 border-t border-white/[0.07] pt-6 text-[15px] text-ink-soft">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="link text-ink">
          Crea una gratis
        </Link>{" "}
        en un minuto.
      </p>
    </>
  );
}
