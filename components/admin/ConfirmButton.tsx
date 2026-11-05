"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

/** Botón destructivo con confirmación en dos pasos (sin diálogos nativos del navegador). */
export function ConfirmButton({ children, message }: { children: React.ReactNode; message: string }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { pending } = useFormStatus();

  if (!armed) {
    return (
      <button
        type="button"
        className="btn btn-ghost text-danger"
        onClick={() => {
          setArmed(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setArmed(false), 5000);
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="sr-only">{message}</span>
      <button type="submit" disabled={pending} className="btn bg-danger-bg text-ink" title={message}>
        {pending ? "Eliminando…" : "Confirmar"}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setArmed(false)}>
        Cancelar
      </button>
    </span>
  );
}
