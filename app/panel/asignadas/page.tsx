import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession, getSpecialties } from "@/lib/data";
import { updateRequest } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { SubmitButton } from "@/components/ui/Form";
import { whatsappUrl } from "@/lib/whatsapp";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

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

  return (
    <>
      <PanelTitle title="Casos asignados" lead="Solicitudes que la firma asignó a tu perfil." />
      {!me ? (
        <p className="bg-graphite p-6 text-ink-soft">Tu cuenta aún no está vinculada a un perfil de abogado. Pide al administrador que la vincule.</p>
      ) : rows.length ? (
        <ul className="space-y-4">
          {rows.map((r) => {
            const wa = r.client?.phone ? whatsappUrl(r.client.phone) : null;
            return (
              <li key={r.id} className="bg-graphite p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[17px] font-medium">{r.subject}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-[14px] text-ink-soft">
                  {r.client?.full_name ?? "Cliente"} · {specialties.find((s) => s.id === r.specialty_id)?.short_name ?? "—"} · {fmt.format(new Date(r.created_at))} · prefiere {r.preferred_contact}
                  {wa ? <> · <a className="link" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></> : null}
                </p>
                <p className="mt-3 whitespace-pre-line text-[15px]">{r.description}</p>
                <form action={updateRequest} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <label htmlFor={`st-${r.id}`} className="sr-only">Estado</label>
                  <select id={`st-${r.id}`} name="status" defaultValue={r.status} className="field min-h-10 w-auto py-1">
                    {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <SubmitButton className="btn btn-secondary min-h-10" pending="…">Actualizar estado</SubmitButton>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="bg-graphite p-6 text-ink-soft">No tienes casos asignados por ahora.</p>
      )}
    </>
  );
}
