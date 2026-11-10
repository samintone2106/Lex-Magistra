import { STATUS_LABEL, type RequestStatus, type ReviewStatus } from "@/lib/types";

/**
 * Estados como escalones de tono de la misma familia (no un arcoíris):
 * pendiente (contorno), en revisión (navy), contactado (niebla, el más claro),
 * cerrado (apagado) y no procede (rojo atenuado, la única excepción de color).
 */
const REQ: Record<RequestStatus, { pill: string; dot: string }> = {
  pendiente: { pill: "border border-white/20 text-ink", dot: "border border-mist" },
  en_revision: { pill: "bg-navy text-ink", dot: "bg-mist/60" },
  contactado: { pill: "bg-mist text-navy", dot: "bg-navy" },
  cerrado: { pill: "bg-white/[0.06] text-ink-soft", dot: "bg-steel" },
  rechazado: { pill: "bg-danger-bg text-danger", dot: "bg-danger" },
};

/** Qué significa cada estado para el cliente y qué sigue. */
export const STATUS_HELP: Record<RequestStatus, string> = {
  pendiente: "Recibimos tu solicitud. El equipo jurídico la revisará y asignará un profesional.",
  en_revision: "Un abogado está estudiando tu caso para darte una orientación.",
  contactado: "Te contactamos por el medio que elegiste. Revisa tu WhatsApp, tus llamadas o tu correo.",
  cerrado: "La solicitud está cerrada. Si necesitas retomarla, crea una nueva o escríbenos.",
  rechazado: "La firma no puede asumir este asunto. Puedes escribirnos para conocer otras alternativas.",
};

/** Orden del recorrido normal de una solicitud. */
export const STATUS_FLOW: RequestStatus[] = ["pendiente", "en_revision", "contactado", "cerrado"];

export const OPEN_STATUSES: RequestStatus[] = ["pendiente", "en_revision"];

export function StatusBadge({ status, size = "md" }: { status: RequestStatus; size?: "sm" | "md" }) {
  const t = REQ[status];
  return (
    <span
      className={`inline-flex flex-none items-center gap-2 whitespace-nowrap font-medium ${size === "sm" ? "min-h-6 px-2 text-[12px]" : "min-h-7 px-2.5 text-[13px]"} ${t.pill}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 ${t.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const REV: Record<ReviewStatus, [string, string, string]> = {
  pendiente: ["border border-white/20 text-ink", "border border-mist", "Por moderar"],
  aprobada: ["bg-mist text-navy", "bg-navy", "Publicada"],
  rechazada: ["bg-white/[0.06] text-ink-soft", "bg-steel", "No publicada"],
};

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const [cls, dot, label] = REV[status];
  return (
    <span className={`inline-flex min-h-7 flex-none items-center gap-2 whitespace-nowrap px-2.5 text-[13px] font-medium ${cls}`}>
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
