import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSession, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { ReviewForm } from "@/components/panel/ReviewForm";
import { ReviewBadge } from "@/components/panel/StatusBadge";
import { Stars } from "@/components/site/Stars";
import type { Review } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function NuevaResenaPage() {
  const session = await getSession();
  const supabase = await createClient();
  const [specialties, lawyers, { data }] = await Promise.all([
    getSpecialties(),
    getLawyers(),
    supabase.from("reviews").select("*").eq("author_id", session?.profile.id ?? "").order("created_at", { ascending: false }),
  ]);
  const mine = (data ?? []) as Review[];
  const parts = (session?.profile.full_name ?? "").split(" ").filter(Boolean);
  const defaultName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0] ?? "";

  return (
    <>
      <PanelTitle title="Opiniones" lead="Tu opinión se publica después de una revisión. No publicamos datos de tu caso." />
      <div className="grid gap-12 xl:grid-cols-[1fr_380px]">
        <ReviewForm specialties={specialties} lawyers={lawyers} defaultName={defaultName} />
        <aside aria-labelledby="mis-resenas">
          <h2 id="mis-resenas" className="mb-4 text-[18px] font-semibold">Mis opiniones</h2>
          {mine.length ? (
            <ul className="space-y-4">
              {mine.map((r) => (
                <li key={r.id} className="bg-graphite p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Stars value={r.rating} size={15} />
                    <ReviewBadge status={r.status} />
                  </div>
                  <p className="mt-3 line-clamp-4 text-[15px]">{r.comment}</p>
                  <p className="mt-2 text-[13px] text-ink-soft">{fmt.format(new Date(r.created_at))}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-ink-soft">Aún no has enviado opiniones.</p>
          )}
        </aside>
      </div>
    </>
  );
}
