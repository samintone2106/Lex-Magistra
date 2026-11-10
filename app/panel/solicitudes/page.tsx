import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { OPEN_STATUSES, StatusBadge } from "@/components/panel/StatusBadge";
import { relativeDay } from "@/components/panel/CaseTimeline";
import { FilterTabs } from "@/components/ui/Panel";
import { BlockError, EmptyState } from "@/components/ui/States";
import type { ConsultationRequest, RequestStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });

/** Vistas del listado: agrupan estados como los entiende el cliente. */
const VIEWS: { key: string; label: string; match: (s: RequestStatus) => boolean }[] = [
  { key: "", label: "Todas", match: () => true },
  { key: "abiertas", label: "Abiertas", match: (s) => OPEN_STATUSES.includes(s) },
  { key: "contactado", label: "Contactado", match: (s) => s === "contactado" },
  { key: "cerradas", label: "Cerradas", match: (s) => s === "cerrado" || s === "rechazado" },
];

export default async function SolicitudesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const view = VIEWS.find((v) => v.key === (estado ?? "")) ?? VIEWS[0];
  const supabase = await createClient();
  const [{ data, error }, specialties, lawyers] = await Promise.all([
    supabase.from("consultation_requests").select("*").order("created_at", { ascending: false }),
    getSpecialties(),
    getLawyers(),
  ]);
  const all = (data ?? []) as ConsultationRequest[];
  const requests = all.filter((r) => view.match(r.status));
  const spec = (id: string) => specialties.find((s) => s.id === id)?.short_name ?? "—";
  const law = (id: string | null) => lawyers.find((l) => l.id === id)?.full_name ?? null;

  return (
    <>
      <PanelTitle
        title="Mis solicitudes"
        lead={all.length ? `${all.length} ${all.length === 1 ? "solicitud enviada" : "solicitudes enviadas"}. Abre una para ver su historial y escribirnos sobre ella.` : "Aquí verás el estado de cada solicitud de asesoría que envíes."}
      >
        <Link href="/panel/nueva-solicitud" className="btn btn-primary">
          Nueva solicitud
        </Link>
      </PanelTitle>

      <FilterTabs
        label="Filtrar por estado"
        items={VIEWS.map((v) => ({
          href: v.key ? `/panel/solicitudes?estado=${v.key}` : "/panel/solicitudes",
          label: v.label,
          count: all.filter((r) => v.match(r.status)).length,
          active: v.key === view.key,
        }))}
      />

      <div className="mt-6">
        {error ? (
          <BlockError what="tus solicitudes" retryHref="/panel/solicitudes" />
        ) : requests.length ? (
          <>
            {/* Escritorio: tabla */}
            <table className="hidden w-full text-left text-[15px] md:table">
              <caption className="sr-only">Mis solicitudes ({view.label.toLowerCase()})</caption>
              <thead className="text-[13px] text-ink-soft">
                <tr>
                  <th scope="col" className="w-[44%] pb-3 pr-4 font-normal">Asunto</th>
                  <th scope="col" className="pb-3 pr-4 font-normal">Abogado</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-normal">Enviada</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-normal">Último cambio</th>
                  <th scope="col" className="pb-3 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="group border-t border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4">
                      <Link href={`/panel/solicitudes/${r.id}`} className="block font-medium hover:text-mist">
                        {r.subject}
                      </Link>
                      <span className="text-[13px] text-ink-soft">{spec(r.specialty_id)}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-ink-soft">{law(r.lawyer_id) ?? <span>La firma asigna</span>}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-ink-soft">
                      <time dateTime={r.created_at}>{fmt.format(new Date(r.created_at))}</time>
                    </td>
                    <td className="py-3.5 pr-4 text-right text-ink-soft">{relativeDay(r.updated_at)}</td>
                    <td className="py-3.5">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Móvil: filas de dos líneas */}
            <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06] md:hidden">
              {requests.map((r) => (
                <li key={r.id}>
                  <Link href={`/panel/solicitudes/${r.id}`} className="flex items-start justify-between gap-3 py-3.5">
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">{r.subject}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">
                        {spec(r.specialty_id)} · {fmt.format(new Date(r.created_at))}
                      </span>
                    </span>
                    <StatusBadge status={r.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : all.length ? (
          <EmptyState
            title={`No tienes solicitudes en «${view.label.toLowerCase()}».`}
            body="Cambia de pestaña para ver las demás o envía una nueva si tienes otro asunto."
            action={{ href: "/panel/solicitudes", label: "Ver todas" }}
          />
        ) : (
          <EmptyState
            title="Aún no has enviado solicitudes."
            body="En cuatro pasos eliges la especialidad, el abogado y nos cuentas tu caso. El equipo te contacta por WhatsApp, llamada o correo."
            action={{ href: "/panel/nueva-solicitud", label: "Crear mi primera solicitud" }}
            secondary={{ href: "/panel/abogados", label: "Ver abogados" }}
          />
        )}
      </div>
    </>
  );
}
