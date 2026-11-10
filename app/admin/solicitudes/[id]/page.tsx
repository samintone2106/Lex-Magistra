import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSpecialties } from "@/lib/data";
import { getAttachments } from "@/lib/attachments";
import { updateRequest } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { AttachmentsPanel } from "@/components/panel/AttachmentsPanel";
import { CaseTimeline, HistoryLog, relativeDay, type HistoryRow } from "@/components/panel/CaseTimeline";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { SubmitButton } from "@/components/ui/Form";
import { KeyValues, Panel } from "@/components/ui/Panel";
import { whatsappUrl } from "@/lib/whatsapp";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const CONTACT: Record<ConsultationRequest["preferred_contact"], string> = { whatsapp: "WhatsApp", llamada: "Llamada", correo: "Correo electrónico" };

export default async function AdminSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data }, { data: history }, { data: lawyers }, specialties, attachments] = await Promise.all([
    supabase.from("consultation_requests").select("*, client:profiles(full_name,phone,document_id,city)").eq("id", id).maybeSingle(),
    supabase.from("request_status_history").select("id,status,note,created_at").eq("request_id", id).order("created_at"),
    supabase.from("lawyers").select("id,full_name,lawyer_specialties(specialty_id)").eq("is_active", true).order("full_name"),
    getSpecialties(),
    getAttachments(supabase, [id]),
  ]);
  if (!data) notFound();
  const r = data as ConsultationRequest & { client: { full_name: string; phone: string | null; document_id: string | null; city: string | null } | null };
  const rows = (history ?? []) as HistoryRow[];
  const spec = specialties.find((s) => s.id === r.specialty_id);
  type L = { id: string; full_name: string; lawyer_specialties: { specialty_id: string }[] };
  const eligible = ((lawyers ?? []) as L[]).filter((l) => l.lawyer_specialties.some((x) => x.specialty_id === r.specialty_id));
  const assigned = ((lawyers ?? []) as L[]).find((l) => l.id === r.lawyer_id);
  const wa = r.client?.phone ? whatsappUrl(r.client.phone, `Hola ${r.client.full_name}, le escribimos por su solicitud "${r.subject}".`) : null;
  const dash = <span className="text-ink-soft">—</span>;

  return (
    <>
      <PanelTitle
        title={r.subject}
        back={{ href: "/admin/solicitudes", label: "Solicitudes" }}
        lead={`${spec?.name ?? "Sin especialidad"} · recibida ${relativeDay(r.created_at)} · ${assigned ? `asignada a ${assigned.full_name}` : "sin abogado asignado"}`}
      >
        <StatusBadge status={r.status} />
      </PanelTitle>

      <Panel title="Recorrido" id="recorrido" meta={`Último cambio ${relativeDay(r.updated_at)}`}>
        <CaseTimeline status={r.status} history={rows} createdAt={r.created_at} />
      </Panel>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-4">
          <Panel title="Cliente" id="cliente">
            <KeyValues
              cols={3}
              items={[
                { label: "Nombre", value: r.client?.full_name || dash },
                { label: "Celular", value: r.client?.phone || dash },
                { label: "Documento", value: r.client?.document_id || dash },
                { label: "Ciudad", value: r.client?.city || dash },
                { label: "Prefiere que lo contacten por", value: CONTACT[r.preferred_contact] },
                {
                  label: "Autorización de datos (Ley 1581)",
                  value: r.data_consent ? <>Otorgada el {fmt.format(new Date(r.data_consent_at))}</> : <span className="text-danger">No registrada</span>,
                },
              ]}
            />
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-6 bg-wa text-carbon hover:bg-white">
                <WhatsAppIcon className="h-5 w-5" /> Escribir al cliente por WhatsApp
                <span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            ) : (
              <p className="mt-6 text-[14px] text-ink-soft">El cliente no registró celular. Pídele que complete su perfil o usa el medio que eligió.</p>
            )}
          </Panel>

          <Panel title="Descripción del caso" id="descripcion" meta={`${r.description.length.toLocaleString("es-CO")} caracteres`}>
            <p className="max-w-[78ch] whitespace-pre-line text-[16px] leading-relaxed">{r.description}</p>
          </Panel>

          {/* El admin consulta y puede retirar documentos indebidos; solo el cliente los sube. */}
          <AttachmentsPanel requestId={r.id} items={attachments[r.id] ?? []} canAdd={false} canRemove empty="El cliente no adjuntó documentos." />
        </div>

        <div className="grid gap-4 xl:sticky xl:top-24">
          <Panel title="Gestionar" id="gestionar">
            <form action={updateRequest} className="grid gap-5">
              <input type="hidden" name="id" value={r.id} />
              <div>
                <label htmlFor="status" className="label">
                  Estado
                </label>
                <select id="status" name="status" defaultValue={r.status} className="field" aria-describedby="status-hint">
                  {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <p id="status-hint" className="mt-1.5 text-[14px] text-ink-soft">
                  El cliente ve el cambio en su panel y queda en el historial.
                </p>
              </div>
              <div>
                <label htmlFor="lawyer_id" className="label">
                  Abogado asignado
                </label>
                <select id="lawyer_id" name="lawyer_id" defaultValue={r.lawyer_id ?? ""} className="field" aria-describedby="lawyer-hint">
                  <option value="">Sin asignar</option>
                  {eligible.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name}
                    </option>
                  ))}
                </select>
                <p id="lawyer-hint" className="mt-1.5 text-[14px] text-ink-soft">
                  {eligible.length
                    ? `${eligible.length} ${eligible.length === 1 ? "abogado publicado atiende" : "abogados publicados atienden"} ${spec?.short_name.toLowerCase() ?? "esta área"}.`
                    : "Ningún abogado publicado atiende esta especialidad. Asígnala desde el perfil del abogado."}
                </p>
              </div>
              <div>
                <label htmlFor="admin_notes" className="label">
                  Notas internas
                </label>
                <textarea
                  id="admin_notes"
                  name="admin_notes"
                  defaultValue={r.admin_notes ?? ""}
                  rows={5}
                  maxLength={4000}
                  placeholder="Ej.: Llamar el lunes; pidió revisar la notificación de la multa."
                  className="field"
                  aria-describedby="notes-hint"
                />
                <p id="notes-hint" className="mt-1.5 text-[14px] text-ink-soft">
                  Solo las ve el equipo, nunca el cliente. Máximo 4.000 caracteres.
                </p>
              </div>
              <SubmitButton pending="Guardando…">Guardar cambios</SubmitButton>
            </form>
          </Panel>

          <Panel title="Historial" id="historial" meta={`${rows.length} ${rows.length === 1 ? "movimiento" : "movimientos"}`}>
            <HistoryLog history={rows} />
          </Panel>
          <Link href="/admin/solicitudes" className="btn btn-ghost justify-self-start">
            Volver al listado
          </Link>
        </div>
      </div>
    </>
  );
}
