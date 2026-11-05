import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PanelTitle } from "@/components/panel/Shell";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import type { Specialty } from "@/lib/types";

export default async function AdminEspecialidades({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("specialties").select("*").order("sort_order");
  const rows = (data ?? []) as Specialty[];
  return (
    <>
      <PanelTitle title="Especialidades" lead="Contenido de cada página de especialidad. Los abogados se asignan desde su perfil.">
        <Link href="/admin/especialidades/nueva" className="btn btn-primary">Nueva especialidad</Link>
      </PanelTitle>
      {ok ? <p role="status" className="mb-6 bg-navy p-4">Especialidad {ok}.</p> : null}
      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((s) => (
          <li key={s.id}>
            <Link href={`/admin/especialidades/${s.id}`} className="flex items-start gap-4 bg-graphite p-5 transition-colors hover:bg-navy">
              <SpecialtyIcon name={s.icon} size={24} className="mt-1 shrink-0 text-mist" />
              <span>
                <span className="block text-[17px] font-medium">{s.name}</span>
                <span className="text-[14px] text-ink-soft">/especialidades/{s.slug} · {s.is_active ? "Publicada" : "Oculta"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!rows.length ? <p className="bg-graphite p-6 text-ink-soft">No hay especialidades. Ejecuta el seed o crea una nueva.</p> : null}
    </>
  );
}
