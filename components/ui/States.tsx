import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

/** Estado vacío: conserva el marco, dice qué pasa y cuál es el siguiente paso. */
export function EmptyState({
  title,
  body,
  action,
  secondary,
  className = "",
}: {
  title: string;
  body?: React.ReactNode;
  action?: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={`border border-dashed border-white/[0.14] p-6 sm:p-8 ${className}`}>
      <p className="text-[17px] font-medium">{title}</p>
      {body ? <div className="mt-1.5 max-w-[60ch] text-[15px] text-ink-soft">{body}</div> : null}
      {action || secondary ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {action ? (
            <Link href={action.href} className="btn btn-primary">
              {action.label}
            </Link>
          ) : null}
          {secondary ? (
            <Link href={secondary.href} className="btn btn-ghost">
              {secondary.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const TONES = {
  info: { cls: "bg-navy", Icon: Info, icon: "text-mist" },
  success: { cls: "bg-navy", Icon: CheckCircle2, icon: "text-mist" },
  warning: { cls: "bg-graphite border-l-2 border-mist", Icon: TriangleAlert, icon: "text-mist" },
  danger: { cls: "bg-danger-bg", Icon: AlertCircle, icon: "text-danger" },
} as const;

/** Aviso en línea dentro de la pantalla. Nunca a pantalla completa. */
export function Notice({
  tone = "info",
  children,
  action,
  className = "",
  role,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const t = TONES[tone];
  return (
    <div role={role ?? (tone === "danger" ? "alert" : "status")} className={`flex items-start gap-3 p-4 text-[15px] ${t.cls} ${className}`}>
      <t.Icon aria-hidden size={18} className={`mt-[3px] shrink-0 ${t.icon}`} />
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Error dentro del bloque que falló, con una salida. */
export function BlockError({ what, retryHref }: { what: string; retryHref?: string }) {
  return (
    <Notice
      tone="danger"
      action={
        retryHref ? (
          <Link href={retryHref} className="link text-[14px] text-ink">
            Reintentar
          </Link>
        ) : null
      }
    >
      No pudimos cargar {what}. Puede ser un fallo momentáneo de conexión.
    </Notice>
  );
}

/** Barra gris al tamaño real del dato que reemplaza mientras carga. */
export function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse bg-white/[0.07] motion-reduce:animate-none ${className}`} />;
}
