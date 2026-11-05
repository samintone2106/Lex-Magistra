import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSpecialties } from "@/lib/data";
import { updateRequest } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { SubmitButton } from "@/components/ui/Form";
import { whatsappUrl } from "@/lib/whatsapp";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data }, { data: history }, { data: lawyers }, specialties] = await Promise.all([
    supabase.from("consultation_requests").select("*, client:profiles(full_name,phone,document_id,city)").eq("id", id).maybeSingle(),
    supabase.from("request_status_history").select("id,status,note,created_at").eq("request_id", id).order("created_at"),
    supabase.from("lawyers").select("id,full_name,lawyer_specialties(specialty_id)").eq("is_active", true).order("full_name"),
    getSpecialties(),
  ]);
  if (!data) notFound();
  const r = data as ConsultationRequest & { client: { full_name: string; phone: string | null; document_id: string | null; city: string | null } | null };
  const spec = specialties.find((s) => s.id === r.specialty_id);
  type L = { id: string; full_name: string; lawyer_specialties: { specialty_id: string }[] };
  const eligible = ((lawyers ?? []) as L[]).filter((l) => l.lawyer_specialties.some((x) => x.specialty_id === r.specialty_id));
  const wa = r.client?.phone ? whatsappUrl(r.client.phone, `Hola ${r.client.full_name}, le escribimos por su solicitud "${r.subject}".`) : null;

  return (
    <>
      <PanelTitle title={r.subject}>
        <StatusBadge status={r.status} />
      </PanelTitle>
      <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div>
          <dl className="grid gap-5 bg-graphite p-6 sm:grid-cols-2">
            <div><dt className="text-[14px] text-ink-soft">Cliente</dt><dd>{r.client?.full_name || "—"}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Teléfono</dt><dd>{r.client?.phone || "—"}{wa ? <> · <a className="link" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></> : null}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Documento</dt><dd>{r.client?.document_id || "—"}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Ciudad</dt><dd>{r.client?.city || "—"}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Especialidad</dt><dd>{spec?.name ?? "—"}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Contacto preferido</dt><dd className="capitalize">{r.preferred_contact}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Recibida</dt><dd>{fmt.format(new Date(r.created_at))}</dd></div>
            <div><dt className="text-[14px] text-ink-soft">Consentimiento de datos</dt><dd>{r.data_consent ? "Otorgado" : "—"}</dd></div>
          </dl>
          <h2 className="mb-3 mt-10 text-[18px] font-semibold">Descripción del caso</h2>
          <p className="whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">{r.description}</p>
        </div>

        <aside className="space-y-10">
          <form action={updateRequest} className="grid gap-4 bg-graphite p-5">
            <h2 className="text-[18px] font-semibold">Gestionar</h2>
            <input type="hidden" name="id" value={r.id} />
            <div>
              <label htmlFor="status" className="label">Estado</label>
              <select id="status" name="status" defaultValue={r.status} className="field bg-carbon">
                {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lawyer_id" className="label">Abogado asignado</label>
              <select id="lawyer_id" name="lawyer_id" defaultValue={r.lawyer_id ?? ""} className="field bg-carbon">
                <option value="">Sin asignar</option>
                {eligible.map((l) => (
                  <option key={l.id} value={l.id}>{l.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="admin_notes" className="label">Notas internas (no las ve el cliente)</label>
              <textarea id="admin_notes" name="admin_notes" defaultValue={r.admin_notes ?? ""} rows={4} className="field bg-carbon" />
            </div>
            <SubmitButton pending="Guardando…">Guardar cambios</SubmitButton>
          </form>
          <section aria-labelledby="hist">
            <h2 id="hist" className="mb-4 text-[18px] font-semibold">Historial</h2>
            <ol className="space-y-4">
              {((history ?? []) as { id: number; status: RequestStatus; note: string | null; created_at: string }[]).map((h) => (
                <li key={h.id} className="text-[14px]">
                  <span className="font-medium">{STATUS_LABEL[h.status]}</span>
                  <span className="text-ink-soft"> · {fmt.format(new Date(h.created_at))}{h.note ? ` · ${h.note}` : ""}</span>
                </li>
              ))}
            </ol>
          </section>
          <Link href="/admin/solicitudes" className="btn btn-ghost">Volver al listado</Link>
        </aside>
      </div>
    </>
  );
}
