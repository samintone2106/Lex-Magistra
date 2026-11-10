import { STATUS_LABEL, type RequestStatus } from "@/lib/types";
import { STATUS_FLOW } from "@/components/panel/StatusBadge";

export interface HistoryRow {
  id: number;
  status: RequestStatus;
  note: string | null;
  created_at: string;
}

const dayFmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });
const fullFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

/** Etapas del recorrido; si la firma dijo «no procede», esa etapa reemplaza el cierre. */
function stagesFor(status: RequestStatus): RequestStatus[] {
  return status === "rechazado" ? ["pendiente", "en_revision", "contactado", "rechazado"] : STATUS_FLOW;
}

/**
 * El expediente: el recorrido de la solicitud por sus etapas, con la fecha en que llegó a cada una
 * (tomada del historial real). Las etapas que se saltaron quedan marcadas sin fecha.
 */
export function CaseTimeline({
  status,
  history,
  createdAt,
  compact = false,
}: {
  status: RequestStatus;
  history: HistoryRow[];
  createdAt: string;
  compact?: boolean;
}) {
  const stages = stagesFor(status);
  const current = Math.max(0, stages.indexOf(status));
  const reachedAt = (s: RequestStatus) => {
    const h = history.find((x) => x.status === s);
    if (h) return h.created_at;
    return s === "pendiente" ? createdAt : null;
  };

  return (
    <ol aria-label="Etapas de la solicitud" className={`grid ${compact ? "grid-cols-4 gap-2" : "gap-0 md:grid-cols-4 md:gap-3"}`}>
      {stages.map((s, i) => {
        const done = i < current;
        const now = i === current;
        const at = i <= current ? reachedAt(s) : null;
        const bar = now ? (s === "rechazado" ? "bg-danger" : "bg-mist") : done ? "bg-mist/45" : "bg-white/[0.1]";
        return (
          <li
            key={s}
            aria-current={now ? "step" : undefined}
            className={compact ? "min-w-0" : "relative grid grid-cols-[16px_1fr] gap-x-4 pb-6 last:pb-0 md:block md:pb-0"}
          >
            {compact ? (
              <>
                <span aria-hidden className={`block h-1 ${bar}`} />
                <span className={`mt-2 block truncate text-[12px] ${now ? "text-ink" : "text-ink-soft"}`}>{STATUS_LABEL[s]}</span>
              </>
            ) : (
              <>
                {/* Línea vertical en móvil, barra horizontal en escritorio */}
                <span aria-hidden className="relative flex justify-center md:hidden">
                  <span className={`mt-1 h-3 w-3 shrink-0 ${now ? (s === "rechazado" ? "bg-danger" : "bg-mist") : done ? "bg-mist/45" : "border border-white/25"}`} />
                  {i < stages.length - 1 ? <span className={`absolute bottom-[-24px] top-5 w-px ${done || now ? "bg-mist/40" : "bg-white/[0.1]"}`} /> : null}
                </span>
                <span aria-hidden className={`hidden h-1 md:block ${bar}`} />
                <div className="md:mt-3">
                  <p className={`text-[15px] ${now ? "font-semibold text-ink" : done ? "text-ink" : "text-ink-soft"}`}>
                    {STATUS_LABEL[s]}
                    <span className="sr-only">{now ? " (etapa actual)" : done ? " (completada)" : " (pendiente)"}</span>
                  </p>
                  <p className="mt-0.5 text-[13px] tabular-nums text-ink-soft">
                    {at ? <time dateTime={at}>{dayFmt.format(new Date(at))}</time> : i <= current ? "Sin registro" : "—"}
                  </p>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Registro completo de cambios, del más reciente al más antiguo. */
export function HistoryLog({ history }: { history: HistoryRow[] }) {
  if (!history.length) {
    return <p className="text-[14px] text-ink-soft">Aún no hay movimientos registrados.</p>;
  }
  const rows = [...history].reverse();
  return (
    <ol className="divide-y divide-white/[0.06]">
      {rows.map((h, i) => (
        <li key={h.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 py-3 first:pt-0 last:pb-0">
          <p className={`text-[15px] ${i === 0 ? "font-medium" : ""}`}>{STATUS_LABEL[h.status]}</p>
          <time dateTime={h.created_at} className="text-right text-[13px] tabular-nums text-ink-soft">
            {fullFmt.format(new Date(h.created_at))}
          </time>
          {h.note ? <p className="col-span-2 text-[14px] text-ink-soft">{h.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}

const rtf = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });

/** «hoy», «ayer», «hace 3 días», «hace 2 meses». */
export function relativeDay(iso: string, now = Date.now()) {
  const days = Math.round((new Date(iso).getTime() - now) / 86_400_000);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(days / 365), "year");
}
