import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSession, getSettings, getSpecialties } from "@/lib/data";
import { getAttachments, isAttachable } from "@/lib/attachments";
import { cancelRequest } from "@/lib/actions/panel";
import { PanelTitle } from "@/components/panel/Shell";
import { STATUS_HELP, StatusBadge } from "@/components/panel/StatusBadge";
import { CaseTimeline, HistoryLog, relativeDay, type HistoryRow } from "@/components/panel/CaseTimeline";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AttachmentsPanel } from "@/components/panel/AttachmentsPanel";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { KeyValues, Panel } from "@/components/ui/Panel";
import { Notice } from "@/components/ui/States";
import { whatsappUrl } from "@/lib/whatsapp";
import type { ConsultationRequest } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short" });
const CONTACT: Record<ConsultationRequest["preferred_contact"], string> = {
  whatsapp: "WhatsApp",
  llamada: "Llamada telefónica",
  correo: "Correo electrónico",
};

export default async function SolicitudPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nueva?: string }> }) {
  const [{ id }, { nueva }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: req }, { data: history }, specialties, lawyers, settings, session, attachments] = await Promise.all([
    supabase.from("consultation_requests").select("*").eq("id", id).maybeSingle(),
    supabase.from("request_status_history").select("id,status,note,created_at").eq("request_id", id).order("created_at"),
    getSpecialties(),
    getLawyers(),
    getSettings(),
    getSession(),
    getAttachments(supabase, [id]),
  ]);
  if (!req) notFound(); // RLS: si no es tuya, no existe para ti
  const r = req as ConsultationRequest;
  const rows = (history ?? []) as HistoryRow[];
  const spec = specialties.find((s) => s.id === r.specialty_id);
  const lawyer = lawyers.find((l) => l.id === r.lawyer_id);
  const wa = whatsappUrl(settings.whatsapp_number, `Hola, consulto por mi solicitud "${r.subject}".`);
  const docs = attachments[r.id] ?? [];
  const owner = session?.profile.id === r.client_id;
  const editable = owner && isAttachable(r.status);

  return (
    <>
      {nueva ? (
        <Notice tone="success" className="mb-6">
          <strong className="font-medium">Tu solicitud quedó registrada.</strong> El equipo jurídico la revisará y te contactará por{" "}
          {CONTACT[r.preferred_contact].toLowerCase()}. Puedes volver aquí para ver en qué va.
        </Notice>
      ) : null}

      <PanelTitle title={r.subject} back={{ href: "/panel/solicitudes", label: "Mis solicitudes" }} lead={`${spec?.name ?? "Especialidad"} · enviada ${relativeDay(r.created_at)}`}>
        <StatusBadge status={r.status} />
      </PanelTitle>

      <Panel title="En qué va tu solicitud" id="estado" meta={`Último cambio ${relativeDay(r.updated_at)}`}>
        <p className="mb-6 max-w-[70ch] text-[15px]">{STATUS_HELP[r.status]}</p>
        <CaseTimeline status={r.status} history={rows} createdAt={r.created_at} />
      </Panel>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          <Panel title="Tu solicitud" id="datos">
            <KeyValues
              items={[
                { label: "Especialidad", value: spec?.name ?? "—" },
                {
                  label: "Abogado",
                  value: lawyer ? (
                    <Link className="link" href={`/abogados/${lawyer.id}`}>
                      {lawyer.full_name}
                    </Link>
                  ) : (
                    "Asignación por la firma"
                  ),
                },
                { label: "Te contactamos por", value: CONTACT[r.preferred_contact] },
                { label: "Enviada", value: <time dateTime={r.created_at}>{fmt.format(new Date(r.created_at))}</time> },
              ]}
            />
            <h3 className="mb-2 mt-8 text-[13px] text-ink-soft">Lo que nos contaste</h3>
            <p className="max-w-[72ch] whitespace-pre-line text-[16px] leading-relaxed">{r.description}</p>
          </Panel>

          <AttachmentsPanel
            requestId={r.id}
            items={docs}
            canAdd={editable}
            canRemove={editable}
            fromWizard={!!nueva && editable}
            empty={
              editable
                ? "Aún no adjuntas documentos. Si tienes el comparendo, la notificación, el contrato o capturas, súbelos aquí."
                : "Esta solicitud no tiene documentos adjuntos."
            }
          />
        </div>

        <div className="grid gap-4">
          <Panel title="¿Necesitas algo más?" id="acciones">
            <div className="grid gap-3">
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn w-full bg-wa text-carbon hover:bg-white">
                  <WhatsAppIcon className="h-5 w-5" /> Preguntar por WhatsApp
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              ) : null}
              <p className="text-[14px] text-ink-soft">
                {editable
                  ? "Puedes adjuntar documentos en el bloque «Documentos». Si quieres agregar información, escríbenos citando el asunto."
                  : "Si quieres agregar información, escríbenos citando el asunto de la solicitud."}
              </p>
              {r.status === "pendiente" ? (
                <form action={cancelRequest} className="border-t border-white/[0.06] pt-3">
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton message="La solicitud quedará cerrada." confirmLabel="Sí, cancelar" pendingLabel="Cancelando…">
                    Cancelar esta solicitud
                  </ConfirmButton>
                  <p className="mt-1 text-[13px] text-ink-soft">Solo puedes cancelarla mientras esté pendiente.</p>
                </form>
              ) : null}
            </div>
          </Panel>

          <Panel title="Historial" id="historial" meta={`${rows.length} ${rows.length === 1 ? "movimiento" : "movimientos"}`}>
            <HistoryLog history={rows} />
          </Panel>
        </div>
      </div>
    </>
  );
}
