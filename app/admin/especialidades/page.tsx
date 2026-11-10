import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PanelTitle } from "@/components/panel/Shell";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import { BlockError, EmptyState, Notice } from "@/components/ui/States";
import type { Specialty } from "@/lib/types";

export default async function AdminEspecialidades({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await createClient();
  const [{ data, error }, { data: links }] = await Promise.all([
    supabase.from("specialties").select("*").order("sort_order"),
    supabase.from("lawyer_specialties").select("specialty_id"),
  ]);
  const rows = (data ?? []) as Specialty[];
  const lawyersPer = new Map<string, number>();
  for (const l of (links ?? []) as { specialty_id: string }[]) lawyersPer.set(l.specialty_id, (lawyersPer.get(l.specialty_id) ?? 0) + 1);
  const published = rows.filter((s) => s.is_active).length;

  return (
    <>
      <PanelTitle
        title="Especialidades"
        lead={rows.length ? `${rows.length} áreas, ${published} publicadas. Cada una tiene su página pública; los abogados se asignan desde su perfil.` : "Contenido de cada página de especialidad."}
      >
        <Link href="/admin/especialidades/nueva" className="btn btn-primary">
          Nueva especialidad
        </Link>
      </PanelTitle>
      {ok ? (
        <Notice tone="success" className="mb-6">
          Especialidad {ok}.
        </Notice>
      ) : null}
      {error ? (
        <BlockError what="las especialidades" retryHref="/admin/especialidades" />
      ) : rows.length ? (
        <table className="w-full text-left text-[15px]">
          <caption className="sr-only">Especialidades</caption>
          <thead className="text-[13px] text-ink-soft">
            <tr>
              <th scope="col" className="pb-3 pr-4 font-normal">Especialidad</th>
              <th scope="col" className="hidden pb-3 pr-4 font-normal md:table-cell">Dirección</th>
              <th scope="col" className="hidden pb-3 pr-4 text-right font-normal sm:table-cell">Abogados</th>
              <th scope="col" className="hidden pb-3 pr-4 text-right font-normal sm:table-cell">Orden</th>
              <th scope="col" className="pb-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const n = lawyersPer.get(s.id) ?? 0;
              return (
                <tr key={s.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/especialidades/${s.id}`} className="flex items-start gap-3 hover:text-mist">
                      <SpecialtyIcon name={s.icon} size={16} className="mt-1 shrink-0 text-ink-soft" />
                      <span>
                        <span className="block font-medium">{s.name}</span>
                        <span className="line-clamp-1 text-[13px] text-ink-soft">{s.summary || "Sin resumen"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden py-3 pr-4 text-[14px] text-ink-soft md:table-cell">/especialidades/{s.slug}</td>
                  <td className={`hidden py-3 pr-4 text-right tabular-nums sm:table-cell ${n ? "" : "text-ink-soft"}`}>{n}</td>
                  <td className="hidden py-3 pr-4 text-right tabular-nums text-ink-soft sm:table-cell">{s.sort_order}</td>
                  <td className="py-3 text-[14px]">
                    <span className={s.is_active ? "text-ink" : "text-ink-soft"}>{s.is_active ? "Publicada" : "Oculta"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <EmptyState
          title="No hay especialidades."
          body="Ejecuta el seed de la base de datos o crea la primera área a mano."
          action={{ href: "/admin/especialidades/nueva", label: "Crear especialidad" }}
        />
      )}
    </>
  );
}
