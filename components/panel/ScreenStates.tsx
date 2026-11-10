"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Bar } from "@/components/ui/States";

/**
 * Carga de una pantalla de trabajo: el diseño final con cada dato reemplazado por una barra
 * del mismo tamaño, para que nada salte cuando llegan los datos.
 */
export function ScreenSkeleton({ variant = "list" }: { variant?: "home" | "list" | "detail" | "form" }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="grid gap-3">
            <Bar className="h-8 w-[min(360px,70vw)]" />
            <Bar className="h-4 w-[min(480px,80vw)]" />
          </div>
          {variant !== "form" ? <Bar className="hidden h-12 w-40 sm:block" /> : null}
        </div>

        {variant === "home" ? (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-4 bg-graphite p-5">
              <Bar className="h-4 w-32" />
              <Bar className="h-6 w-2/3" />
              <Bar className="h-1 w-full" />
              <Bar className="h-4 w-3/4" />
            </div>
            <div className="grid gap-4 bg-graphite p-5">
              <Bar className="h-4 w-28" />
              <Bar className="h-8 w-full" />
            </div>
          </div>
        ) : null}

        {variant === "list" ? (
          <>
            <div className="flex gap-6 border-b border-white/[0.08] pb-3">
              {[56, 64, 80, 64].map((w, i) => (
                <span key={i} style={{ width: w }}>
                  <Bar className="h-4" />
                </span>
              ))}
            </div>
            <ul className="mt-6 divide-y divide-white/[0.06]">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-4">
                  <span className="grid flex-1 gap-2">
                    <Bar className="h-4 w-[min(420px,70%)]" />
                    <Bar className="h-3 w-32" />
                  </span>
                  <Bar className="h-6 w-24" />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {variant === "detail" ? (
          <>
            <div className="grid gap-5 bg-graphite p-5">
              <Bar className="h-4 w-48" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Bar key={i} className="h-1" />
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="grid gap-4 bg-graphite p-5">
                <Bar className="h-4 w-1/2" />
                <Bar className="h-4 w-2/3" />
                <Bar className="h-24 w-full" />
              </div>
              <div className="grid gap-4 bg-graphite p-5">
                <Bar className="h-12 w-full" />
                <Bar className="h-4 w-3/4" />
              </div>
            </div>
          </>
        ) : null}

        {variant === "form" ? (
          <div className="grid max-w-[720px] gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="grid gap-2">
                <Bar className="h-4 w-36" />
                <Bar className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Error de una pantalla del panel: dentro del marco, qué falló, reintento y una salida. */
export function ScreenError({ error, reset, home }: { error: Error & { digest?: string }; reset: () => void; home: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section aria-labelledby="error-title" className="max-w-[640px]">
      <h1 id="error-title" className="font-display text-[30px] leading-tight sm:text-[34px]">
        No pudimos cargar esta pantalla
      </h1>
      <div role="alert" className="mt-6 flex items-start gap-3 bg-danger-bg p-4 text-[15px]">
        <AlertCircle aria-hidden size={18} className="mt-[3px] shrink-0 text-danger" />
        <p>
          Puede ser un fallo momentáneo de conexión con la base de datos. Tus datos no se perdieron.
          {error.digest ? <span className="mt-1 block text-[13px] text-ink-soft">Código de referencia: {error.digest}</span> : null}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          <RotateCcw aria-hidden size={16} /> Intentar de nuevo
        </button>
        <Link href={home} className="btn btn-secondary">
          Volver al resumen
        </Link>
      </div>
    </section>
  );
}
