import { createClient } from "@/lib/supabase/server";
import { deleteReview, moderateReview } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { ReviewBadge } from "@/components/panel/StatusBadge";
import { relativeDay } from "@/components/panel/CaseTimeline";
import { Stars } from "@/components/site/Stars";
import { SubmitButton } from "@/components/ui/Form";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { FilterTabs } from "@/components/ui/Panel";
import { BlockError, EmptyState } from "@/components/ui/States";
import type { Review, ReviewStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
const FILTERS: [ReviewStatus | "", string][] = [
  ["", "Todas"],
  ["pendiente", "Por moderar"],
  ["aprobada", "Publicadas"],
  ["rechazada", "No publicadas"],
];

export default async function AdminResenas({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const active = (["pendiente", "aprobada", "rechazada"] as string[]).includes(estado ?? "") ? (estado as ReviewStatus) : "";
  const supabase = await createClient();
  let q = supabase
    .from("reviews")
    .select("*, lawyer:lawyers(full_name), specialty:specialties(short_name), author:profiles!reviews_author_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (active) q = q.eq("status", active);
  const countFor = (s: ReviewStatus) => supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", s);
  const [{ data, error }, pend, ok, no] = await Promise.all([q, countFor("pendiente"), countFor("aprobada"), countFor("rechazada")]);
  const counts: Record<string, number> = { pendiente: pend.count ?? 0, aprobada: ok.count ?? 0, rechazada: no.count ?? 0 };
  counts[""] = counts.pendiente + counts.aprobada + counts.rechazada;
  type Row = Review & { lawyer: { full_name: string } | null; specialty: { short_name: string } | null; author: { full_name: string } | null };
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PanelTitle
        title="Reseñas"
        lead={
          counts.pendiente
            ? `${counts.pendiente} ${counts.pendiente === 1 ? "opinión espera" : "opiniones esperan"} moderación. Aprueba solo las que no traen datos sensibles, números de proceso ni información de terceros.`
            : "No hay opiniones por moderar. Aprueba solo las que no traen datos sensibles ni información de terceros."
        }
      />
      <FilterTabs
        label="Filtrar reseñas"
        items={FILTERS.map(([v, label]) => ({ href: v ? `/admin/resenas?estado=${v}` : "/admin/resenas", label, count: counts[v], active: active === v }))}
      />
      <div className="mt-6">
        {error ? (
          <BlockError what="las reseñas" retryHref="/admin/resenas" />
        ) : rows.length ? (
          <ul className="grid gap-3">
            {rows.map((r) => (
              <li key={r.id} className="bg-graphite p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Stars value={r.rating} size={16} />
                    <span className="text-[14px] tabular-nums text-ink-soft">{r.rating} de 5</span>
                  </div>
                  <ReviewBadge status={r.status} />
                </div>
                <blockquote className="mt-3 max-w-[80ch] text-[16px] leading-relaxed">{r.comment}</blockquote>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                  <div className="flex gap-1.5">
                    <dt className="text-ink-soft">Autor:</dt>
                    <dd>{r.author?.full_name ?? "—"}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-ink-soft">Se publicaría como:</dt>
                    <dd>{r.show_name ? r.public_name : "Cliente verificado"}</dd>
                  </div>
                  {r.specialty ? (
                    <div className="flex gap-1.5">
                      <dt className="text-ink-soft">Área:</dt>
                      <dd>{r.specialty.short_name}</dd>
                    </div>
                  ) : null}
                  {r.lawyer ? (
                    <div className="flex gap-1.5">
                      <dt className="text-ink-soft">Abogado:</dt>
                      <dd>{r.lawyer.full_name}</dd>
                    </div>
                  ) : null}
                  <div className="flex gap-1.5">
                    <dt className="text-ink-soft">Enviada:</dt>
                    <dd>
                      {fmt.format(new Date(r.created_at))} ({relativeDay(r.created_at)})
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                  {r.status !== "aprobada" ? (
                    <form action={moderateReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="aprobada" />
                      <SubmitButton className="btn btn-primary min-h-10 text-[14px]" pending="Publicando…">
                        Aprobar y publicar
                      </SubmitButton>
                    </form>
                  ) : null}
                  {r.status !== "rechazada" ? (
                    <form action={moderateReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="rechazada" />
                      <SubmitButton className="btn btn-secondary min-h-10 bg-navy text-[14px] hover:bg-carbon" pending="Guardando…">
                        {r.status === "aprobada" ? "Despublicar" : "No publicar"}
                      </SubmitButton>
                    </form>
                  ) : null}
                  <form action={deleteReview} className="ml-auto">
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Se borrará para siempre.">Eliminar</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={active === "pendiente" ? "No hay opiniones por moderar." : "No hay reseñas en esta vista."}
            body="Los clientes escriben sus opiniones desde su panel. Aparecen aquí antes de publicarse."
            action={active ? { href: "/admin/resenas", label: "Ver todas" } : undefined}
          />
        )}
      </div>
    </>
  );
}
