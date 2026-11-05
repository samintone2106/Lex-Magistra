import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };

export default function RestablecerPage() {
  return (
    <>
      <h1 className="font-display text-[clamp(44px,5vw,64px)]">Nueva contraseña</h1>
      <p className="mb-8 mt-3 text-[17px] text-ink-soft">Escribe tu nueva contraseña.</p>
      <NewPasswordForm />
    </>
  );
}
