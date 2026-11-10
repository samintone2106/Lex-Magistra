import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession, getSpecialties } from "@/lib/data";
import { getAttachments } from "@/lib/attachments";
import { updateRequest } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { OPEN_STATUSES, StatusBadge } from "@/components/panel/StatusBadge";
import { relativeDay } from "@/components/panel/CaseTimeline";
import { SubmitButton } from "@/components/ui/Form";
import { AttachmentList } from "@/components/ui/Attachments";
import { EmptyState, Notice } from "@/components/ui/States";
import { whatsappUrl } from "@/lib/whatsapp";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
const CONTACT: Record<ConsultationRequest["preferred_contact"], string> = { whatsapp: "WhatsApp", llamada: "llamada", correo: "correo" };

/** Vista del rol abogado: solo las solicitudes asignadas a su perfil (RLS lo garantiza). */
export default async function AsignadasPage() {
  const session = await getSession();
  if (session?.profile.role !== "lawyer") redirect("/panel");
  const supabase = await createClient();
  const { data: me } = await supabase.from("lawyers").select("id").eq("profile_id", session.profile.id).maybeSingle();
  const specialties = await getSpecialties();
  const { data } = me
    ? await supabase
        .from("consultation_requests")
        .select("*, client:profiles(full_name,phone)")
        .eq("lawyer_id", me.id)
        .order("created_at", { ascending: false })
    : { data: [] };
  type Row = ConsultationRequest & { client: { full_name: string; phone: string | null } | null };
  const rows = (data ?? []) as Row[];
  const open = rows.filter((r) => OPEN_STATUSES.includes(r.status)).length;
  const attachments = await getAttachments(supabase, rows.map((r) => r.id));

  return (
    <>
      <PanelTitle
        title="Casos asignados"
        lead={
          rows.length
            ? `${rows.length} ${rows.length === 1 ? "caso asignado" : "casos asignados"} a tu perfil, ${open} pendiente${open === 1 ? "" : "s"} o en revisión.`
            : "Solicitudes que la firma asignó a tu perfil."
        }
      />
      {!me ? (
        <Notice tone="warning">Tu cuenta aún no está vinculada a un perfil de abogado. Pide al administrador que la vincule desde Abogados.</Notice>
      ) : rows.length ? (
        <ul className="grid gap-4">
          {rows.map((r) => {
            const wa = r.client?.phone ? whatsappUrl(r.client.phone) : null;
            return (
              <li key={r.id} className="bg-graphite p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold">{r.subject}</p>
                    <p className="mt-1 text-[14px] text-ink-soft">
                      {r.client?.full_name ?? "Cliente"} · {specialties.find((s) => s.id === r.specialty_id)?.short_name ?? "—"} · recibida{" "}
                      {fmt.format(new Date(r.created_at))} ({relativeDay(r.created_at)})
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-4 max-w-[80ch] whitespace-pre-line text-[15px] leading-relaxed">{r.description}</p>
                {attachments[r.id]?.length ? (
                  <div className="mt-5">
                    <h3 className="mb-2 text-[13px] text-ink-soft">Documentos del cliente ({attachments[r.id].length})</h3>
                    <AttachmentList items={attachments[r.id]} canRemove={false} />
                  </div>
                ) : null}
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
                  <p className="text-[14px] text-ink-soft">
                    Prefiere {CONTACT[r.preferred_contact]}
                    {r.client?.phone ? ` · ${r.client.phone}` : " · sin celular registrado"}
                    {wa ? (
                      <>
                        {" · "}
                        <a className="link text-ink" href={wa} target="_blank" rel="noopener noreferrer">
                          Escribir por WhatsApp
                        </a>
                      </>
                    ) : null}
                  </p>
                  <form action={updateRequest} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <div>
                      <label htmlFor={`st-${r.id}`} className="label text-[13px]">
                        Estado del caso
                      </label>
                      <select id={`st-${r.id}`} name="status" defaultValue={r.status} className="field min-h-10 w-auto py-1">
                        {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <SubmitButton className="btn btn-secondary min-h-10 bg-navy hover:bg-carbon" pending="Guardando…">
                      Actualizar estado
                    </SubmitButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No tienes casos asignados por ahora." body="Cuando la firma te asigne una solicitud aparecerá aquí con los datos de contacto del cliente." />
      )}
    </>
  );
}
