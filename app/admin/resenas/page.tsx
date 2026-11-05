import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteReview, moderateReview } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { ReviewBadge } from "@/components/panel/StatusBadge";
import { Stars } from "@/components/site/Stars";
import { SubmitButton } from "@/components/ui/Form";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import type { Review, ReviewStatus } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
const FILTERS: [ReviewStatus | "", string][] = [["", "Todas"], ["pendiente", "Pendientes"], ["aprobada", "Publicadas"], ["rechazada", "Rechazadas"]];

export default async function AdminResenas({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("reviews").select("*, lawyer:lawyers(full_name), specialty:specialties(short_name), author:profiles!reviews_author_id_fkey(full_name)").order("created_at", { ascending: false }).limit(200);
  if (estado && ["pendiente", "aprobada", "rechazada"].includes(estado)) q = q.eq("status", estado);
  const { data, error } = await q;
  type Row = Review & { lawyer: { full_name: string } | null; specialty: { short_name: string } | null; author: { full_name: string } | null };
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PanelTitle title="Reseñas" lead="Aprueba solo opiniones sin datos sensibles ni información de terceros." />
      <nav aria-label="Filtrar reseñas" className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(([v, label]) => (
          <Link key={label} href={v ? `/admin/resenas?estado=${v}` : "/admin/resenas"} className={`inline-flex min-h-10 items-center px-3 text-[14px] ${(estado ?? "") === v ? "bg-mist text-navy" : "bg-graphite hover:bg-navy"}`}>
            {label}
          </Link>
        ))}
      </nav>
      {error ? <p role="alert" className="mb-6 bg-danger-bg p-4">No pudimos cargar las reseñas.</p> : null}
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="bg-graphite p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} size={16} />
                <ReviewBadge status={r.status} />
              </div>
              <span className="text-[14px] text-ink-soft">{fmt.format(new Date(r.created_at))}</span>
            </div>
            <p className="mt-3 max-w-[80ch] text-[16px]">{r.comment}</p>
            <p className="mt-2 text-[14px] text-ink-soft">
              Autor: {r.author?.full_name ?? "—"} · Público como: {r.show_name ? r.public_name : "Cliente verificado"}
              {r.specialty ? ` · ${r.specialty.short_name}` : ""}
              {r.lawyer ? ` · ${r.lawyer.full_name}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.status !== "aprobada" ? (
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="aprobada" />
                  <SubmitButton pending="…">Aprobar y publicar</SubmitButton>
                </form>
              ) : null}
              {r.status !== "rechazada" ? (
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="rechazada" />
                  <SubmitButton className="btn btn-secondary" pending="…">{r.status === "aprobada" ? "Despublicar" : "Rechazar"}</SubmitButton>
                </form>
              ) : null}
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton message="¿Eliminar esta reseña definitivamente?">Eliminar</ConfirmButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {!rows.length ? <p className="bg-graphite p-6 text-ink-soft">No hay reseñas en esta vista.</p> : null}
    </>
  );
}
