"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Esqueleto de carga para páginas internas: cabecera y una rejilla de bloques con el pulso suave del sitio. */
export function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  return (
    <div role="status" aria-live="polite" className="bg-carbon pb-[var(--section-gap)] pt-36 lg:pt-44">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden className="frame">
        <div className="skeleton h-[clamp(48px,7vw,110px)] w-[min(720px,80%)]" />
        <div className="skeleton mt-8 h-5 w-[min(520px,90%)]" />
        <div className="skeleton mt-3 h-5 w-[min(420px,70%)]" />
        {variant === "grid" ? (
          <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton mt-4 h-5 w-3/4" />
                <div className="skeleton mt-2 h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20 grid gap-3 lg:ml-[33%]">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton h-40" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Error de una página interna: mensaje claro, reintento y una salida. */
export function RouteError({ error, reset, what }: { error: Error & { digest?: string }; reset: () => void; what: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section aria-labelledby="error-title" className="bg-carbon pb-[var(--section-gap)] pt-36 lg:pt-44">
      <div className="frame grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 id="error-title" className="font-display text-[clamp(42px,6vw,96px)]">
            No pudimos cargar {what}
          </h1>
          <p className="mt-8 max-w-[52ch] text-[18px]">
            Puede ser un problema momentáneo de conexión. Intenta de nuevo; si persiste, escríbenos y te ayudamos por otro
            medio.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="btn btn-primary">
              Intentar de nuevo
            </button>
            <Link href="/contacto" className="btn btn-secondary">
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
