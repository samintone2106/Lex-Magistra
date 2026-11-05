import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function SolicitudesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("consultation_requests").select("*").order("created_at", { ascending: false });
  if (estado && estado in STATUS_LABEL) q = q.eq("status", estado);
  const [{ data, error }, specialties, lawyers] = await Promise.all([q, getSpecialties(), getLawyers()]);
  const requests = (data ?? []) as ConsultationRequest[];
  const spec = (id: string) => specialties.find((s) => s.id === id)?.short_name ?? "—";
  const law = (id: string | null) => lawyers.find((l) => l.id === id)?.full_name ?? "Asignación por la firma";
  const chip = (on: boolean) => `inline-flex min-h-10 items-center px-3 text-[14px] ${on ? "bg-mist text-navy" : "bg-graphite hover:bg-navy"}`;

  return (
    <>
      <PanelTitle title="Mis solicitudes" lead="Estado e historial de todas tus solicitudes de asesoría.">
        <Link href="/panel/nueva-solicitud" className="btn btn-primary">
          Nueva solicitud
        </Link>
      </PanelTitle>
      <nav aria-label="Filtrar por estado" className="mb-6 flex flex-wrap gap-2">
        <Link href="/panel/solicitudes" className={chip(!estado)}>
          Todas
        </Link>
        {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
          <Link key={s} href={`/panel/solicitudes?estado=${s}`} className={chip(estado === s)}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </nav>
      {error ? (
        <p role="alert" className="bg-danger-bg p-4">
          No pudimos cargar tus solicitudes. Recarga la página.
        </p>
      ) : null}
      {requests.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="text-[14px] text-ink-soft">
              <tr>
                <th scope="col" className="py-3 pr-4 font-normal">Asunto</th>
                <th scope="col" className="py-3 pr-4 font-normal">Especialidad</th>
                <th scope="col" className="py-3 pr-4 font-normal">Abogado</th>
                <th scope="col" className="py-3 pr-4 font-normal">Fecha</th>
                <th scope="col" className="py-3 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-graphite">
                  <td className="py-4 pr-4">
                    <Link href={`/panel/solicitudes/${r.id}`} className="link font-medium">
                      {r.subject}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 text-ink-soft">{spec(r.specialty_id)}</td>
                  <td className="py-4 pr-4 text-ink-soft">{law(r.lawyer_id)}</td>
                  <td className="py-4 pr-4 text-ink-soft">{fmt.format(new Date(r.created_at))}</td>
                  <td className="py-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-graphite p-8">
          <p className="text-[17px]">{estado ? "No hay solicitudes con este estado." : "Aún no has enviado solicitudes."}</p>
          <Link href="/panel/nueva-solicitud" className="btn btn-primary mt-5">
            Crear una solicitud
          </Link>
        </div>
      )}
    </>
  );
}
