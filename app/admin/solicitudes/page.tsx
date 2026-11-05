import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function AdminSolicitudes({ searchParams }: { searchParams: Promise<{ estado?: string; especialidad?: string }> }) {
  const { estado, especialidad } = await searchParams;
  const supabase = await createClient();
  const specialties = await getSpecialties();
  let q = supabase
    .from("consultation_requests")
    .select("*, client:profiles(full_name,phone), lawyer:lawyers(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (estado && estado in STATUS_LABEL) q = q.eq("status", estado);
  const spec = specialties.find((s) => s.slug === especialidad);
  if (spec) q = q.eq("specialty_id", spec.id);
  const { data, error } = await q;
  type Row = ConsultationRequest & { client: { full_name: string; phone: string | null } | null; lawyer: { full_name: string } | null };
  const rows = (data ?? []) as Row[];
  const chip = (on: boolean) => `inline-flex min-h-10 items-center px-3 text-[14px] ${on ? "bg-mist text-navy" : "bg-graphite hover:bg-navy"}`;
  const qs = (e?: string, s?: string) => {
    const p = new URLSearchParams();
    if (e) p.set("estado", e);
    if (s) p.set("especialidad", s);
    const str = p.toString();
    return `/admin/solicitudes${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <PanelTitle title="Solicitudes de asesoría" lead="Revisa, asigna y cambia el estado de cada solicitud." />
      <nav aria-label="Filtrar por estado" className="mb-3 flex flex-wrap gap-2">
        <Link href={qs(undefined, especialidad)} className={chip(!estado)}>Todos los estados</Link>
        {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
          <Link key={s} href={qs(s, especialidad)} className={chip(estado === s)}>{STATUS_LABEL[s]}</Link>
        ))}
      </nav>
      <nav aria-label="Filtrar por especialidad" className="mb-8 flex flex-wrap gap-2">
        <Link href={qs(estado)} className={chip(!spec)}>Todas las áreas</Link>
        {specialties.map((s) => (
          <Link key={s.slug} href={qs(estado, s.slug)} className={chip(spec?.slug === s.slug)}>{s.short_name}</Link>
        ))}
      </nav>
      {error ? <p role="alert" className="bg-danger-bg p-4">No pudimos cargar las solicitudes.</p> : null}
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[15px]">
            <thead className="text-[14px] text-ink-soft">
              <tr>
                <th scope="col" className="py-3 pr-4 font-normal">Asunto</th>
                <th scope="col" className="py-3 pr-4 font-normal">Cliente</th>
                <th scope="col" className="py-3 pr-4 font-normal">Área</th>
                <th scope="col" className="py-3 pr-4 font-normal">Abogado</th>
                <th scope="col" className="py-3 pr-4 font-normal">Fecha</th>
                <th scope="col" className="py-3 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-graphite">
                  <td className="py-4 pr-4"><Link href={`/admin/solicitudes/${r.id}`} className="link font-medium">{r.subject}</Link></td>
                  <td className="py-4 pr-4 text-ink-soft">{r.client?.full_name || "—"}</td>
                  <td className="py-4 pr-4 text-ink-soft">{specialties.find((s) => s.id === r.specialty_id)?.short_name ?? "—"}</td>
                  <td className="py-4 pr-4 text-ink-soft">{r.lawyer?.full_name ?? "Sin asignar"}</td>
                  <td className="py-4 pr-4 text-ink-soft">{fmt.format(new Date(r.created_at))}</td>
                  <td className="py-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="bg-graphite p-6 text-ink-soft">No hay solicitudes con estos filtros.</p>
      )}
    </>
  );
}
