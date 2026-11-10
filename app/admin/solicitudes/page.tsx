import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { OPEN_STATUSES, StatusBadge } from "@/components/panel/StatusBadge";
import { relativeDay } from "@/components/panel/CaseTimeline";
import { FilterTabs } from "@/components/ui/Panel";
import { BlockError, EmptyState } from "@/components/ui/States";
import { STATUS_LABEL, type ConsultationRequest, type RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const LIMIT = 200;
const STATUSES = Object.keys(STATUS_LABEL) as RequestStatus[];

export default async function AdminSolicitudes({ searchParams }: { searchParams: Promise<{ estado?: string; especialidad?: string; q?: string }> }) {
  const { estado, especialidad, q } = await searchParams;
  const supabase = await createClient();
  const specialties = await getSpecialties();
  const spec = specialties.find((s) => s.slug === especialidad);
  const term = q?.trim().slice(0, 80).replace(/[%_,()]/g, "") ?? "";
  const statusFilter: RequestStatus[] | null = estado === "abiertas" ? OPEN_STATUSES : estado && estado in STATUS_LABEL ? [estado as RequestStatus] : null;

  let list = supabase
    .from("consultation_requests")
    .select("*, client:profiles(full_name,phone), lawyer:lawyers(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (statusFilter) list = list.in("status", statusFilter);
  if (spec) list = list.eq("specialty_id", spec.id);
  if (term) list = list.ilike("subject", `%${term}%`);

  // Conteos por estado para las pestañas (respetan el filtro de especialidad).
  const countFor = (status: RequestStatus) => {
    let c = supabase.from("consultation_requests").select("id", { count: "exact", head: true }).eq("status", status);
    if (spec) c = c.eq("specialty_id", spec.id);
    return c;
  };
  const [{ data, error, count: total }, ...counts] = await Promise.all([list, ...STATUSES.map(countFor)]);
  const byStatus = Object.fromEntries(STATUSES.map((s, i) => [s, counts[i].count ?? 0])) as Record<RequestStatus, number>;
  const allCount = STATUSES.reduce((n, s) => n + byStatus[s], 0);
  type Row = ConsultationRequest & { client: { full_name: string; phone: string | null } | null; lawyer: { full_name: string } | null };
  const rows = (data ?? []) as Row[];

  const qs = (over: { estado?: string | null; especialidad?: string | null; q?: string | null }) => {
    const p = new URLSearchParams();
    const e = over.estado === undefined ? estado : over.estado;
    const s = over.especialidad === undefined ? especialidad : over.especialidad;
    const t = over.q === undefined ? term : over.q;
    if (e) p.set("estado", e);
    if (s) p.set("especialidad", s);
    if (t) p.set("q", t);
    const str = p.toString();
    return `/admin/solicitudes${str ? `?${str}` : ""}`;
  };
  const activeKey = estado === "abiertas" || (estado && estado in STATUS_LABEL) ? estado : "";

  return (
    <>
      <PanelTitle
        title="Solicitudes de asesoría"
        lead={`${byStatus.pendiente} pendiente${byStatus.pendiente === 1 ? "" : "s"} de revisar y ${byStatus.en_revision} en revisión${spec ? ` en ${spec.short_name.toLowerCase()}` : ""}. Abre una para asignar abogado y cambiar su estado.`}
      />

      <FilterTabs
        label="Filtrar por estado"
        items={[
          { href: qs({ estado: null }), label: "Todas", count: allCount, active: activeKey === "" },
          { href: qs({ estado: "abiertas" }), label: "Abiertas", count: byStatus.pendiente + byStatus.en_revision, active: activeKey === "abiertas" },
          ...STATUSES.map((s) => ({ href: qs({ estado: s }), label: STATUS_LABEL[s], count: byStatus[s], active: activeKey === s })),
        ]}
      />

      {/* Barra de herramientas: búsqueda y área (GET, el estado queda en la URL) */}
      <form method="get" role="search" className="mt-5 flex flex-wrap items-end gap-3">
        {activeKey ? <input type="hidden" name="estado" value={activeKey} /> : null}
        <div className="w-full sm:w-[320px]">
          <label htmlFor="q" className="label text-[13px]">
            Buscar por asunto
          </label>
          <div className="relative">
            <Search aria-hidden size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input id="q" name="q" type="search" defaultValue={term} placeholder="Ej.: fotomulta" className="field min-h-10 py-2 pl-10" />
          </div>
        </div>
        <div className="w-full sm:w-[240px]">
          <label htmlFor="especialidad" className="label text-[13px]">
            Especialidad
          </label>
          <select id="especialidad" name="especialidad" defaultValue={spec?.slug ?? ""} className="field min-h-10 py-2">
            <option value="">Todas las áreas</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.short_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary min-h-10">
          Aplicar
        </button>
        {term || spec ? (
          <Link href={qs({ q: null, especialidad: null })} className="btn btn-ghost min-h-10 text-[14px] text-ink-soft">
            Quitar filtros
          </Link>
        ) : null}
        <p className="ml-auto text-[14px] tabular-nums text-ink-soft" aria-live="polite">
          {(total ?? rows.length).toLocaleString("es-CO")} {total === 1 ? "resultado" : "resultados"}
          {total && total > LIMIT ? ` · se muestran las ${LIMIT} más recientes` : ""}
        </p>
      </form>

      <div className="mt-5">
        {error ? (
          <BlockError what="las solicitudes" retryHref={qs({})} />
        ) : rows.length ? (
          <>
            <div className="hidden md:block">
              <table className="w-full text-left text-[15px]">
                <caption className="sr-only">Solicitudes de asesoría</caption>
                <thead className="text-[13px] text-ink-soft">
                  <tr>
                    <th scope="col" className="w-[36%] pb-3 pr-4 font-normal">Asunto</th>
                    <th scope="col" className="pb-3 pr-4 font-normal">Cliente</th>
                    <th scope="col" className="pb-3 pr-4 font-normal">Abogado</th>
                    <th scope="col" className="pb-3 pr-4 text-right font-normal">Recibida</th>
                    <th scope="col" className="pb-3 font-normal">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                      <td className="py-3 pr-4">
                        <Link href={`/admin/solicitudes/${r.id}`} className="block font-medium hover:text-mist">
                          {r.subject}
                        </Link>
                        <span className="text-[13px] text-ink-soft">{specialties.find((s) => s.id === r.specialty_id)?.short_name ?? "—"}</span>
                      </td>
                      <td className="py-3 pr-4">
                        {r.client?.full_name || <span className="text-ink-soft">—</span>}
                        <span className="block text-[13px] text-ink-soft">{r.client?.phone || "Sin celular"}</span>
                      </td>
                      <td className="py-3 pr-4">{r.lawyer?.full_name ?? <span className="text-ink-soft">Sin asignar</span>}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        <time dateTime={r.created_at}>{fmt.format(new Date(r.created_at))}</time>
                        <span className="block text-[13px] text-ink-soft">{relativeDay(r.created_at)}</span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06] md:hidden">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/solicitudes/${r.id}`} className="flex items-start justify-between gap-3 py-3.5">
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">{r.subject}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">
                        {r.client?.full_name || "—"} · {r.lawyer?.full_name ?? "Sin asignar"} · {relativeDay(r.created_at)}
                      </span>
                    </span>
                    <StatusBadge status={r.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : allCount ? (
          <EmptyState title="Ninguna solicitud coincide con estos filtros." body="Prueba otra pestaña, otra especialidad o una búsqueda más corta." action={{ href: "/admin/solicitudes", label: "Ver todas" }} />
        ) : (
          <EmptyState title="Todavía no hay solicitudes." body="Los clientes las envían desde su panel. Comparte el enlace de registro o revisa que el sitio muestre el botón de solicitar asesoría." />
        )}
      </div>
    </>
  );
}
