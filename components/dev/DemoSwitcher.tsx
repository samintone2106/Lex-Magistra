"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { UserRound, X } from "lucide-react";
import { switchDemoAccount } from "@/lib/actions/demo";
import { DEMO_ACCOUNTS, type DemoKey } from "@/lib/demo-accounts";

/**
 * Barra flotante para saltar entre las cuentas de prueba (solo desarrollo).
 * Atajo: Alt + 1 / 2 / 3. Se puede ocultar y queda un botón pequeño.
 */
export function DemoSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<DemoKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = useCallback((key: DemoKey) => {
    setError(null);
    setBusy(key);
    start(async () => {
      const res = await switchDemoAccount(key);
      if (res && !res.ok) setError(res.message);
      setBusy(null);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const i = ["1", "2", "3"].indexOf(e.key);
      if (i >= 0) {
        e.preventDefault();
        go(DEMO_ACCOUNTS[i].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/panel/asignadas") ? "abogado" : pathname.startsWith("/panel") ? "cliente" : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mostrar cambio de cuenta de prueba"
        className="fixed bottom-4 left-4 z-[95] grid h-11 w-11 place-items-center bg-mist text-navy transition-transform duration-150 ease-[var(--ease-out)] active:scale-95"
      >
        <UserRound size={18} aria-hidden />
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Cambiar de cuenta de prueba"
      className="fixed bottom-4 left-4 z-[95] max-w-[calc(100vw-32px)] bg-carbon p-2 text-ink outline outline-1 outline-white/10"
    >
      <div className="flex items-center gap-1">
        <span className="px-2 text-[13px] text-ink-soft">Probar como</span>
        {DEMO_ACCOUNTS.map((a, i) => (
          <button
            key={a.key}
            type="button"
            disabled={pending}
            onClick={() => go(a.key)}
            aria-current={current === a.key ? "true" : undefined}
            title={`${a.email} · Alt+${i + 1}`}
            className={`min-h-9 px-3 text-[14px] font-medium transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-95 disabled:opacity-60 ${
              current === a.key ? "bg-mist text-navy" : "bg-graphite text-ink hover:bg-navy"
            }`}
          >
            {busy === a.key ? "Entrando…" : a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Ocultar cambio de cuenta"
          className="grid h-9 w-9 place-items-center text-ink-soft hover:text-ink"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 px-2 text-[13px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
