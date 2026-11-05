import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import type { ConsultationRequest } from "@/lib/types";

interface Stats {
  clients: number;
  lawyers: number;
  requests_total: number;
  requests_open: number;
  reviews_pending: number;
  messages_open: number;
  by_specialty: { name: string; total: number }[];
}

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function AdminHome() {
  const supabase = await createClient();
  const [{ data: stats, error }, { data: latest }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase.from("consultation_requests").select("id,subject,status,created_at").order("created_at", { ascending: false }).limit(6),
  ]);
  const s = stats as Stats | null;
  const max = Math.max(1, ...(s?.by_specialty ?? []).map((b) => b.total));

  const tiles: [string, number | undefined, string][] = [
    ["Solicitudes abiertas", s?.requests_open, "/admin/solicitudes?estado=pendiente"],
    ["Solicitudes totales", s?.requests_total, "/admin/solicitudes"],
    ["Clientes registrados", s?.clients, "/admin/usuarios"],
    ["Abogados activos", s?.lawyers, "/admin/abogados"],
    ["Reseñas por moderar", s?.reviews_pending, "/admin/resenas?estado=pendiente"],
    ["Mensajes sin atender", s?.messages_open, "/admin/mensajes"],
  ];

  return (
    <>
      <PanelTitle title="Estadísticas" lead="Estado general de la plataforma." />
      {error ? <p role="alert" className="mb-6 bg-danger-bg p-4">No pudimos cargar las estadísticas.</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(([label, value, href]) => (
          <Link key={label} href={href} className="group bg-graphite p-5 transition-colors hover:bg-navy">
            <p className="text-[14px] text-ink-soft">{label}</p>
            <p className="font-display mt-2 text-[48px] leading-none tabular-nums">{value ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="por-area">
          <h2 id="por-area" className="mb-4 text-[18px] font-semibold">Solicitudes por especialidad</h2>
          <ul className="space-y-3">
            {(s?.by_specialty ?? []).map((b) => (
              <li key={b.name} className="grid grid-cols-[minmax(0,180px)_1fr_40px] items-center gap-3 text-[14px]">
                <span className="truncate text-ink-soft">{b.name}</span>
                <span className="h-3 bg-graphite">
                  <span className="block h-full bg-mist" style={{ width: `${(b.total / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{b.total}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="ultimas">
          <h2 id="ultimas" className="mb-4 text-[18px] font-semibold">Últimas solicitudes</h2>
          {(latest ?? []).length ? (
            <ul className="divide-y divide-carbon bg-graphite">
              {(latest as Pick<ConsultationRequest, "id" | "subject" | "status" | "created_at">[]).map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/solicitudes/${r.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-navy">
                    <span className="min-w-0">
                      <span className="block truncate text-[15px]">{r.subject}</span>
                      <span className="text-[13px] text-ink-soft">{fmt.format(new Date(r.created_at))}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bg-graphite p-5 text-[15px] text-ink-soft">Todavía no hay solicitudes.</p>
          )}
        </section>
      </div>
    </>
  );
}
