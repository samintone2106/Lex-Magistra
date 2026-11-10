import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Superficies de las pantallas de trabajo. La elevación es solo un paso de tono:
 * suelo carbón → panel grafito → bloque anidado navy. Sin sombras ni bordes en reposo.
 */
export function Panel({
  title,
  id,
  meta,
  action,
  children,
  className = "",
  flush = false,
}: {
  title?: React.ReactNode;
  id?: string;
  /** Texto gris a la derecha del título (periodo, total). */
  meta?: React.ReactNode;
  /** Enlace o botón del encabezado ("Ver todas"). */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Sin relleno interior: para listas que llegan al borde. */
  flush?: boolean;
}) {
  return (
    <section aria-labelledby={title && id ? id : undefined} className={`bg-graphite ${className}`}>
      {title ? (
        <header className={`flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pt-4 ${flush ? "pb-3" : "pb-0"}`}>
          <h2 id={id} className="text-[16px] font-semibold">
            {title}
          </h2>
          {meta || action ? (
            <div className="flex items-center gap-4 text-[14px] text-ink-soft">
              {meta ? <span>{meta}</span> : null}
              {action}
            </div>
          ) : null}
        </header>
      ) : null}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-9 items-center gap-1.5 text-[14px] text-ink hover:text-mist">
      {children}
      <ArrowRight aria-hidden size={15} className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Cifras de una misma familia en un solo contenedor dividido por líneas finas. */
export function StatStrip({ items }: { items: { label: string; value: React.ReactNode; note?: React.ReactNode; href?: string }[] }) {
  const cols = items.length === 4 ? "sm:grid-cols-4" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <ul className={`grid grid-cols-2 gap-px bg-white/[0.06] ${cols} ${items.length % 2 ? "[&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1" : ""}`}>
      {items.map((it) => {
        const body = (
          <>
            <p className="text-[14px] text-ink-soft">{it.label}</p>
            <p className="font-display mt-2 text-[34px] leading-none tabular-nums">{it.value}</p>
            {it.note ? <p className="mt-2 text-[13px] text-ink-soft">{it.note}</p> : null}
          </>
        );
        return (
          <li key={it.label} className="flex">
            {it.href ? (
              <Link href={it.href} className="block w-full bg-graphite p-5 transition-colors duration-200 hover:bg-navy focus-visible:bg-navy">
                {body}
              </Link>
            ) : (
              <div className="w-full bg-graphite p-5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Lista clave-valor para la ficha de un objeto. */
export function KeyValues({ items, cols = 2 }: { items: { label: string; value: React.ReactNode }[]; cols?: 1 | 2 | 3 }) {
  const grid = cols === 3 ? "sm:grid-cols-2 xl:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "";
  return (
    <dl className={`grid gap-x-8 gap-y-5 ${grid}`}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-[13px] text-ink-soft">{it.label}</dt>
          <dd className="mt-1 break-words text-[15px]">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Pestañas de filtro como enlaces (estado en la URL). La seleccionada lleva una línea de 2px. */
export function FilterTabs({ label, items }: { label: string; items: { href: string; label: string; count?: number; active: boolean }[] }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-6 border-b border-white/[0.08]">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`relative flex min-h-11 items-center gap-2 text-[14px] transition-colors duration-200 ${
                it.active ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {it.label}
              {it.count !== undefined ? <span className="tabular-nums text-ink-soft">{it.count}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Iniciales estables para personas sin foto. */
export function initialsOf(name: string) {
  // Solo palabras que empiezan por letra: ignora "(ejemplo)", correos y signos.
  const parts = name.replace(/@.*$/, "").trim().split(/\s+/).filter((w) => /^\p{L}/u.test(w));
  if (!parts.length) return "·";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function Initials({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className="grid shrink-0 place-items-center bg-navy font-medium text-mist"
    >
      {initialsOf(name)}
    </span>
  );
}
