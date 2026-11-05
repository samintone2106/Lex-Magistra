import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteLawyer } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

const OK: Record<string, string> = { creado: "Perfil creado.", editado: "Perfil actualizado.", eliminado: "Perfil eliminado." };

export default async function AdminAbogados({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lawyers")
    .select("id,full_name,title,is_active,accepts_consultations, firm:firms(name), lawyer_specialties(specialty:specialties(short_name))")
    .order("full_name");
  type Row = {
    id: string;
    full_name: string;
    title: string;
    is_active: boolean;
    accepts_consultations: boolean;
    firm: { name: string } | null;
    lawyer_specialties: { specialty: { short_name: string } | null }[];
  };
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <PanelTitle title="Abogados" lead="Crea, edita y publica los perfiles de los abogados.">
        <Link href="/admin/abogados/nuevo" className="btn btn-primary">Nuevo abogado</Link>
      </PanelTitle>
      {ok && OK[ok] ? <p role="status" className="mb-6 bg-navy p-4">{OK[ok]}</p> : null}
      {error ? <p role="alert" className="mb-6 bg-danger-bg p-4">No pudimos cargar los abogados.</p> : null}
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[15px]">
            <thead className="text-[14px] text-ink-soft">
              <tr>
                <th scope="col" className="py-3 pr-4 font-normal">Nombre</th>
                <th scope="col" className="py-3 pr-4 font-normal">Firma</th>
                <th scope="col" className="py-3 pr-4 font-normal">Especialidades</th>
                <th scope="col" className="py-3 pr-4 font-normal">Estado</th>
                <th scope="col" className="py-3 font-normal"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-graphite">
                  <td className="py-4 pr-4">
                    <Link href={`/admin/abogados/${l.id}`} className="link font-medium">{l.full_name}</Link>
                    <span className="block text-[13px] text-ink-soft">{l.title}</span>
                  </td>
                  <td className="py-4 pr-4 text-ink-soft">{l.firm?.name ?? "—"}</td>
                  <td className="py-4 pr-4 text-ink-soft">{l.lawyer_specialties.map((s) => s.specialty?.short_name).filter(Boolean).join(", ") || "—"}</td>
                  <td className="py-4 pr-4 text-ink-soft">{l.is_active ? "Publicado" : "Oculto"}{l.accepts_consultations ? "" : " · sin cupo"}</td>
                  <td className="py-4 text-right">
                    <form action={deleteLawyer} className="inline">
                      <input type="hidden" name="id" value={l.id} />
                      <ConfirmButton message={`¿Eliminar el perfil de ${l.full_name}? Esta acción no se puede deshacer.`}>Eliminar</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-graphite p-8">
          <p className="text-[17px]">Aún no hay abogados registrados.</p>
          <Link href="/admin/abogados/nuevo" className="btn btn-primary mt-5">Crear el primer perfil</Link>
        </div>
      )}
    </>
  );
}
