import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSettings, getSpecialties } from "@/lib/data";
import { cancelRequest } from "@/lib/actions/panel";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { whatsappUrl } from "@/lib/whatsapp";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

interface HistoryRow {
  id: number;
  status: RequestStatus;
  note: string | null;
  created_at: string;
}

export default async function SolicitudPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nueva?: string }> }) {
  const [{ id }, { nueva }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: req }, { data: history }, specialties, lawyers, settings] = await Promise.all([
    supabase.from("consultation_requests").select("*").eq("id", id).maybeSingle(),
    supabase.from("request_status_history").select("id,status,note,created_at").eq("request_id", id).order("created_at"),
    getSpecialties(),
    getLawyers(),
    getSettings(),
  ]);
  if (!req) notFound(); // RLS: si no es tuya, no existe para ti
  const r = req as ConsultationRequest;
  const spec = specialties.find((s) => s.id === r.specialty_id);
  const lawyer = lawyers.find((l) => l.id === r.lawyer_id);
  const wa = whatsappUrl(settings.whatsapp_number, `Hola, consulto por mi solicitud "${r.subject}".`);

  return (
    <>
      {nueva ? (
        <p role="status" className="mb-8 bg-navy p-5 text-[16px]">
          Tu solicitud quedó registrada. El equipo jurídico la revisará y te contactará por el medio que elegiste.
        </p>
      ) : null}
      <PanelTitle title={r.subject}>
        <StatusBadge status={r.status} />
      </PanelTitle>
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <dl className="grid gap-5 bg-graphite p-6 sm:grid-cols-2">
            <div>
              <dt className="text-[14px] text-ink-soft">Especialidad</dt>
              <dd>{spec?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[14px] text-ink-soft">Abogado</dt>
              <dd>
                {lawyer ? (
                  <Link className="link" href={`/abogados/${lawyer.id}`}>
                    {lawyer.full_name}
                  </Link>
                ) : (
                  "Asignación por la firma"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[14px] text-ink-soft">Contacto preferido</dt>
              <dd className="capitalize">{r.preferred_contact}</dd>
            </div>
            <div>
              <dt className="text-[14px] text-ink-soft">Enviada</dt>
              <dd>{fmt.format(new Date(r.created_at))}</dd>
            </div>
          </dl>
          <h2 className="mb-3 mt-10 text-[18px] font-semibold">Descripción</h2>
          <p className="whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">{r.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-wa text-carbon">
                <WhatsAppIcon className="h-5 w-5" /> Preguntar por WhatsApp
              </a>
            ) : null}
            {r.status === "pendiente" ? (
              <form action={cancelRequest}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="btn btn-secondary">
                  Cancelar solicitud
                </button>
              </form>
            ) : null}
            <Link href="/panel/solicitudes" className="btn btn-ghost">
              Volver
            </Link>
          </div>
        </div>
        <aside aria-labelledby="hist">
          <h2 id="hist" className="mb-4 text-[18px] font-semibold">
            Historial
          </h2>
          <ol className="space-y-5">
            {((history ?? []) as HistoryRow[]).map((h) => (
              <li key={h.id} className="grid grid-cols-[12px_1fr] gap-3">
                <span aria-hidden className="mt-1.5 h-3 w-3 bg-mist" />
                <div>
                  <p className="text-[15px] font-medium">{STATUS_LABEL[h.status]}</p>
                  <p className="text-[14px] text-ink-soft">
                    {fmt.format(new Date(h.created_at))}
                    {h.note ? ` · ${h.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
