import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/data";
import { setUserRole } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { SubmitButton } from "@/components/ui/Form";
import { ROLE_LABEL, type Profile, type UserRole } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const session = await getSession();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(300);
  const term = q?.trim().slice(0, 60);
  if (term) query = query.ilike("full_name", `%${term.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  const users = (data ?? []) as Profile[];

  return (
    <>
      <PanelTitle title="Usuarios y roles" lead="Administradores gestionan todo; abogados ven las solicitudes asignadas a su perfil; clientes solo las suyas." />
      <form method="get" className="mb-8 flex max-w-[520px] gap-2" role="search">
        <label htmlFor="q" className="sr-only">Buscar por nombre</label>
        <input id="q" name="q" defaultValue={q} placeholder="Buscar por nombre" className="field" />
        <button type="submit" className="btn btn-secondary">Buscar</button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="text-[14px] text-ink-soft">
            <tr>
              <th scope="col" className="py-3 pr-4 font-normal">Nombre</th>
              <th scope="col" className="py-3 pr-4 font-normal">Teléfono</th>
              <th scope="col" className="py-3 pr-4 font-normal">Registro</th>
              <th scope="col" className="py-3 font-normal">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-graphite">
                <td className="py-4 pr-4">{u.full_name || "Sin nombre"}</td>
                <td className="py-4 pr-4 text-ink-soft">{u.phone || "—"}</td>
                <td className="py-4 pr-4 text-ink-soft">{fmt.format(new Date(u.created_at))}</td>
                <td className="py-3">
                  {u.id === session?.profile.id ? (
                    <span className="text-ink-soft">{ROLE_LABEL[u.role]} (tú)</span>
                  ) : (
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <label htmlFor={`role-${u.id}`} className="sr-only">Rol de {u.full_name}</label>
                      <select id={`role-${u.id}`} name="role" defaultValue={u.role} className="field min-h-10 w-auto py-1">
                        {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                      <SubmitButton className="btn btn-secondary min-h-10" pending="…">Aplicar</SubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!users.length ? <p className="mt-4 bg-graphite p-6 text-ink-soft">No hay usuarios con ese criterio.</p> : null}
    </>
  );
}
