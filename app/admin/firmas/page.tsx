import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteFirm } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { FirmForm } from "@/components/admin/FirmForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Panel } from "@/components/ui/Panel";
import { BlockError } from "@/components/ui/States";
import type { Firm } from "@/lib/types";

export default async function AdminFirmas() {
  const supabase = await createClient();
  const [{ data, error }, { data: lawyers }] = await Promise.all([
    supabase.from("firms").select("*").order("name"),
    supabase.from("lawyers").select("firm_id"),
  ]);
  const firms = (data ?? []) as Firm[];
  const per = new Map<string, number>();
  for (const l of (lawyers ?? []) as { firm_id: string | null }[]) if (l.firm_id) per.set(l.firm_id, (per.get(l.firm_id) ?? 0) + 1);
  const active = firms.filter((f) => f.is_active).length;

  return (
    <>
      <PanelTitle
        title="Firmas jurídicas"
        lead={
          firms.length
            ? `${firms.length} ${firms.length === 1 ? "firma registrada" : "firmas registradas"}, ${active} activa${active === 1 ? "" : "s"}. El cliente puede elegir firma de preferencia al solicitar asesoría.`
            : "Registra las firmas a las que pertenecen los abogados."
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel title="Registradas" id="registradas" meta={firms.length ? `${firms.length}` : undefined} flush>
          {error ? (
            <div className="px-5 pb-5">
              <BlockError what="las firmas" retryHref="/admin/firmas" />
            </div>
          ) : firms.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {firms.map((f) => {
                const n = per.get(f.id) ?? 0;
                return (
                  <li key={f.id}>
                    <details className="group">
                      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-medium">{f.name}</span>
                          <span className="block truncate text-[13px] text-ink-soft">
                            {f.city || "Sin ciudad"} · {n} {n === 1 ? "abogado" : "abogados"}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3 text-[14px]">
                          <span className={f.is_active ? "text-ink" : "text-ink-soft"}>{f.is_active ? "Activa" : "Inactiva"}</span>
                          <span className="text-ink-soft group-open:hidden">Editar</span>
                          <ChevronDown aria-hidden size={16} className="text-ink-soft transition-transform duration-200 group-open:rotate-180" />
                        </span>
                      </summary>
                      <div className="grid gap-4 bg-navy/40 px-5 py-5">
                        <FirmForm firm={f} />
                        <form action={deleteFirm} className="border-t border-white/[0.06] pt-4">
                          <input type="hidden" name="id" value={f.id} />
                          <ConfirmButton message={n ? `Sus ${n} abogados quedarán sin firma.` : "Se borrará la firma."}>Eliminar firma</ConfirmButton>
                        </form>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mx-5 mb-5 border border-dashed border-white/[0.14] p-4 text-[14px] text-ink-soft">
              Aún no hay firmas registradas. Usa el formulario para crear la primera; luego podrás asignarla a los abogados.
            </p>
          )}
        </Panel>
        <Panel title="Registrar firma" id="nueva-firma" className="xl:sticky xl:top-24">
          <FirmForm />
        </Panel>
      </div>
    </>
  );
}
