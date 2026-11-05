import { createClient } from "@/lib/supabase/server";
import { deleteFirm } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { FirmForm } from "@/components/admin/FirmForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import type { Firm } from "@/lib/types";

export default async function AdminFirmas() {
  const supabase = await createClient();
  const { data } = await supabase.from("firms").select("*").order("name");
  const firms = (data ?? []) as Firm[];
  return (
    <>
      <PanelTitle title="Firmas jurídicas" lead="Registra las firmas a las que pertenecen los abogados. El usuario puede elegir firma al solicitar asesoría." />
      <div className="grid gap-12 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {firms.length ? (
            firms.map((f) => (
              <details key={f.id} className="group bg-graphite">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5">
                  <span className="text-[17px] font-medium">{f.name}</span>
                  <span className="text-[14px] text-ink-soft">{f.is_active ? "Activa" : "Inactiva"} · Editar</span>
                </summary>
                <div className="space-y-4 px-5 pb-5">
                  <FirmForm firm={f} />
                  <form action={deleteFirm}>
                    <input type="hidden" name="id" value={f.id} />
                    <ConfirmButton message={`¿Eliminar la firma ${f.name}? Los abogados quedarán sin firma.`}>Eliminar firma</ConfirmButton>
                  </form>
                </div>
              </details>
            ))
          ) : (
            <p className="bg-graphite p-6 text-ink-soft">Aún no hay firmas registradas.</p>
          )}
        </div>
        <section aria-labelledby="nueva-firma" className="bg-graphite p-5">
          <h2 id="nueva-firma" className="mb-4 text-[18px] font-semibold">Registrar firma</h2>
          <FirmForm />
        </section>
      </div>
    </>
  );
}
