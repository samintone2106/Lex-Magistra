import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { relativeDay } from "@/components/panel/CaseTimeline";
import { getAdminStats } from "@/components/admin/stats";
import { Panel, PanelLink, StatStrip } from "@/components/ui/Panel";
import { BlockError, EmptyState } from "@/components/ui/States";
import type { ConsultationRequest } from "@/lib/types";

type Latest = Pick<ConsultationRequest, "id" | "subject" | "status" | "created_at"> & { client: { full_name: string } | null };

export default async function AdminHome() {
  const supabase = await createClient();
  const [{ stats: s, failed }, { data: latest, error: latestError }] = await Promise.all([
    getAdminStats(),
    supabase.from("consultation_requests").select("id,subject,status,created_at, client:profiles(full_name)").order("created_at", { ascending: false }).limit(6),
  ]);
  const rows = (latest ?? []) as unknown as Latest[];
  const bySpec = (s?.by_specialty ?? []).filter((b) => b.total > 0);
  const zeroSpecs = (s?.by_specialty ?? []).filter((b) => b.total === 0);
  const max = Math.max(1, ...bySpec.map((b) => b.total));
  const queue = (s?.requests_open ?? 0) + (s?.reviews_pending ?? 0) + (s?.messages_open ?? 0);
  const show = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString("es-CO"));

  const finding = !s
    ? "No pudimos leer los contadores de la plataforma."
    : queue === 0
      ? "No hay nada por atender: todas las solicitudes, reseñas y mensajes están al día."
      : `Por atender: ${s.requests_open} ${s.requests_open === 1 ? "solicitud abierta" : "solicitudes abiertas"}, ${s.reviews_pending} ${s.reviews_pending === 1 ? "reseña" : "reseñas"} por moderar y ${s.messages_open} ${s.messages_open === 1 ? "mensaje" : "mensajes"} sin responder.`;

  return (
    <>
      <PanelTitle title="Resumen" lead={finding}>
        <Link href="/admin/solicitudes?estado=pendiente" className="btn btn-primary">
          Revisar pendientes
        </Link>
      </PanelTitle>

      {failed ? <BlockError what="las estadísticas" retryHref="/admin" /> : null}

      <section aria-labelledby="cola">
        <h2 id="cola" className="sr-only">
          Por atender
        </h2>
        <StatStrip
          items={[
            { label: "Solicitudes abiertas", value: show(s?.requests_open), note: "Pendientes y en revisión", href: "/admin/solicitudes?estado=abiertas" },
            { label: "Reseñas por moderar", value: show(s?.reviews_pending), note: "Esperan aprobación para publicarse", href: "/admin/resenas?estado=pendiente" },
            { label: "Mensajes sin atender", value: show(s?.messages_open), note: "Del formulario de contacto", href: "/admin/mensajes?vista=pendientes" },
          ]}
        />
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Últimas solicitudes" id="ultimas" action={<PanelLink href="/admin/solicitudes">Ver todas</PanelLink>} flush>
          {latestError ? (
            <div className="px-5 pb-5">
              <BlockError what="las últimas solicitudes" retryHref="/admin" />
            </div>
          ) : rows.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/admin/solicitudes/${r.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors duration-150 hover:bg-white/[0.03]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium">{r.subject}</span>
                      <span className="block truncate text-[13px] text-ink-soft">
                        {r.client?.full_name || "Cliente sin nombre"} · {relativeDay(r.created_at)}
                      </span>
                    </span>
                    <StatusBadge status={r.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 pb-5">
              <EmptyState title="Todavía no hay solicitudes." body="Cuando un cliente envíe una solicitud desde su panel aparecerá aquí." />
            </div>
          )}
        </Panel>

        <Panel title="Solicitudes por especialidad" id="por-area" meta={s ? `${show(s.requests_total)} en total` : undefined}>
          {bySpec.length ? (
            <ul className="grid gap-4">
              {bySpec.map((b) => (
                <li key={b.name}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="truncate">{b.name}</span>
                    <span className="tabular-nums text-ink">{b.total.toLocaleString("es-CO")}</span>
                  </div>
                  <span aria-hidden className="mt-1.5 block h-1 bg-white/[0.06]">
                    <span className="block h-full bg-mist" style={{ width: `${(b.total / max) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-ink-soft">Sin solicitudes registradas todavía.</p>
          )}
          {zeroSpecs.length && bySpec.length ? (
            <p className="mt-5 text-[13px] text-ink-soft">Sin solicitudes: {zeroSpecs.map((z) => z.name).join(", ")}.</p>
          ) : null}
        </Panel>
      </div>

      <section aria-labelledby="directorio" className="mt-4">
        <h2 id="directorio" className="sr-only">
          Directorio
        </h2>
        <StatStrip
          items={[
            { label: "Solicitudes totales", value: show(s?.requests_total), href: "/admin/solicitudes" },
            { label: "Clientes registrados", value: show(s?.clients), href: "/admin/usuarios" },
            { label: "Abogados publicados", value: show(s?.lawyers), href: "/admin/abogados" },
          ]}
        />
      </section>
    </>
  );
}
