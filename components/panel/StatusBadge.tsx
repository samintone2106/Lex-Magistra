import { STATUS_LABEL, type RequestStatus, type ReviewStatus } from "@/lib/types";

const REQ: Record<RequestStatus, string> = {
  pendiente: "bg-steel text-ink",
  en_revision: "bg-navy text-ink",
  contactado: "bg-mist text-navy",
  cerrado: "bg-graphite text-ink-soft",
  rechazado: "bg-danger-bg text-ink",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`inline-flex min-h-7 items-center px-2.5 text-[13px] font-medium ${REQ[status]}`}>{STATUS_LABEL[status]}</span>;
}

const REV: Record<ReviewStatus, [string, string]> = {
  pendiente: ["bg-steel text-ink", "Pendiente de moderación"],
  aprobada: ["bg-mist text-navy", "Publicada"],
  rechazada: ["bg-danger-bg text-ink", "No publicada"],
};

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const [cls, label] = REV[status];
  return <span className={`inline-flex min-h-7 items-center px-2.5 text-[13px] font-medium ${cls}`}>{label}</span>;
}
