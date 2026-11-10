"use client";

import { usePathname } from "next/navigation";

/** Bloque de cierre del pie. No se muestra donde la página ya termina en el formulario de contacto. */
export function FooterClose({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/contacto") return null;
  return <>{children}</>;
}
