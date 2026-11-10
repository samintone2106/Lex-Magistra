"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Botón destructivo con confirmación en dos pasos (sin diálogos nativos del navegador).
 * El primer clic arma la acción y muestra la consecuencia; se desarma solo a los 6 s.
 */
export function ConfirmButton({
  children,
  message,
  confirmLabel = "Sí, eliminar",
  pendingLabel = "Eliminando…",
  className = "btn btn-ghost min-h-10 text-[14px] text-danger hover:text-ink",
}: {
  children: React.ReactNode;
  message: string;
  confirmLabel?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (armed) confirmRef.current?.focus();
    return () => clearTimeout(timer.current);
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          setArmed(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setArmed(false), 6000);
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <span role="group" aria-label="Confirmar acción" className="inline-flex flex-wrap items-center gap-2">
      <span className="text-[14px] text-ink-soft" aria-live="polite">
        {message}
      </span>
      <button ref={confirmRef} type="submit" disabled={pending} className="btn min-h-10 bg-danger-bg px-4 text-[14px] text-ink hover:bg-danger hover:text-carbon">
        {pending ? pendingLabel : confirmLabel}
      </button>
      <button type="button" className="btn btn-ghost min-h-10 text-[14px]" onClick={() => setArmed(false)}>
        No, volver
      </button>
    </span>
  );
}
