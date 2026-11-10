import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSession, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { ReviewForm } from "@/components/panel/ReviewForm";
import { ReviewBadge } from "@/components/panel/StatusBadge";
import { Stars } from "@/components/site/Stars";
import { Panel } from "@/components/ui/Panel";
import { BlockError } from "@/components/ui/States";
import type { Review } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function NuevaResenaPage() {
  const session = await getSession();
  const supabase = await createClient();
  const [specialties, lawyers, { data, error }] = await Promise.all([
    getSpecialties(),
    getLawyers(),
    supabase.from("reviews").select("*").eq("author_id", session?.profile.id ?? "").order("created_at", { ascending: false }),
  ]);
  const mine = (data ?? []) as Review[];
  const parts = (session?.profile.full_name ?? "").split(" ").filter(Boolean);
  const defaultName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0] ?? "";
  const pending = mine.filter((r) => r.status === "pendiente").length;
  const published = mine.filter((r) => r.status === "aprobada").length;

  return (
    <>
      <PanelTitle
        title="Opiniones"
        lead="Tu opinión ayuda a otras personas a elegir. Se publica después de una revisión para proteger tu privacidad y la de terceros."
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Escribir una opinión" id="escribir">
          <ReviewForm specialties={specialties} lawyers={lawyers} defaultName={defaultName} />
        </Panel>

        <Panel
          title="Mis opiniones"
          id="mis-resenas"
          meta={mine.length ? `${published} publicada${published === 1 ? "" : "s"} · ${pending} por moderar` : undefined}
          flush
        >
          {error ? (
            <div className="px-5 pb-5">
              <BlockError what="tus opiniones" retryHref="/panel/resenas/nueva" />
            </div>
          ) : mine.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {mine.map((r) => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <Stars value={r.rating} size={15} />
                    <ReviewBadge status={r.status} />
                  </div>
                  <p className="mt-3 line-clamp-4 text-[15px]">{r.comment}</p>
                  <p className="mt-2 text-[13px] text-ink-soft">
                    {fmt.format(new Date(r.created_at))} · firmada como {r.show_name ? r.public_name : "Cliente verificado"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 pb-5">
              <p className="border border-dashed border-white/[0.14] p-4 text-[14px] text-ink-soft">
                Aún no has enviado opiniones. Las que escribas aparecerán aquí con su estado de moderación.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
