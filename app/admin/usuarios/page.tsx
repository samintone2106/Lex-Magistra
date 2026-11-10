import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/data";
import { setUserRole } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { SubmitButton } from "@/components/ui/Form";
import { FilterTabs, Initials } from "@/components/ui/Panel";
import { BlockError, EmptyState } from "@/components/ui/States";
import { ROLE_LABEL, type Profile, type UserRole } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const ROLES = Object.keys(ROLE_LABEL) as UserRole[];
const LIMIT = 300;

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ q?: string; rol?: string }> }) {
  const { q, rol } = await searchParams;
  const role = ROLES.includes(rol as UserRole) ? (rol as UserRole) : null;
  const supabase = await createClient();
  const session = await getSession();
  const term = q?.trim().slice(0, 60).replace(/[%_]/g, "") ?? "";
  let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(LIMIT);
  if (term) query = query.ilike("full_name", `%${term}%`);
  if (role) query = query.eq("role", role);
  const [{ data, error, count }, ...roleCounts] = await Promise.all([
    query,
    ...ROLES.map((r) => supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", r)),
  ]);
  const users = (data ?? []) as Profile[];
  const byRole = Object.fromEntries(ROLES.map((r, i) => [r, roleCounts[i].count ?? 0])) as Record<UserRole, number>;
  const all = ROLES.reduce((n, r) => n + byRole[r], 0);
  const href = (r: UserRole | null) => {
    const p = new URLSearchParams();
    if (r) p.set("rol", r);
    if (term) p.set("q", term);
    const s = p.toString();
    return `/admin/usuarios${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PanelTitle
        title="Usuarios y roles"
        lead="Los administradores gestionan todo; los abogados ven solo las solicitudes asignadas a su perfil; los clientes, solo las suyas."
      />

      <FilterTabs
        label="Filtrar por rol"
        items={[
          { href: href(null), label: "Todos", count: all, active: !role },
          ...ROLES.map((r) => ({ href: href(r), label: `${ROLE_LABEL[r]}${r === "admin" ? "es" : "s"}`, count: byRole[r], active: role === r })),
        ]}
      />

      <form method="get" role="search" className="mt-5 flex flex-wrap items-end gap-3">
        {role ? <input type="hidden" name="rol" value={role} /> : null}
        <div className="w-full sm:w-[320px]">
          <label htmlFor="q" className="label text-[13px]">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search aria-hidden size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input id="q" name="q" type="search" defaultValue={term} placeholder="Ej.: Gómez" autoComplete="off" className="field min-h-10 py-2 pl-10" />
          </div>
        </div>
        <button type="submit" className="btn btn-secondary min-h-10">
          Buscar
        </button>
        {term ? (
          <Link href={href(role)} className="btn btn-ghost min-h-10 text-[14px] text-ink-soft">
            Quitar búsqueda
          </Link>
        ) : null}
        <p className="ml-auto text-[14px] tabular-nums text-ink-soft">
          {(count ?? users.length).toLocaleString("es-CO")} {count === 1 ? "usuario" : "usuarios"}
          {count && count > LIMIT ? ` · se muestran los ${LIMIT} más recientes` : ""}
        </p>
      </form>

      <div className="mt-5">
        {error ? (
          <BlockError what="los usuarios" retryHref="/admin/usuarios" />
        ) : users.length ? (
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {users.map((u) => {
              const me = u.id === session?.profile.id;
              return (
                <li key={u.id} className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 py-3 md:grid-cols-[36px_minmax(0,1.4fr)_minmax(0,1fr)_120px_minmax(260px,auto)]">
                  <Initials name={u.full_name || "?"} size={36} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.full_name || <span className="text-ink-soft">Sin nombre</span>}</p>
                    <p className="truncate text-[13px] text-ink-soft">
                      {u.city || "Sin ciudad"}
                      {u.data_consent_at ? " · autorizó tratamiento de datos" : ""}
                    </p>
                  </div>
                  <p className="col-start-2 text-[14px] text-ink-soft md:col-start-auto">{u.phone || "Sin celular"}</p>
                  <p className="col-start-2 text-[14px] tabular-nums text-ink-soft md:col-start-auto md:text-right">
                    <time dateTime={u.created_at}>{fmt.format(new Date(u.created_at))}</time>
                  </p>
                  <div className="col-start-2 md:col-start-auto md:justify-self-end">
                    {me ? (
                      <span className="text-[14px] text-ink-soft">{ROLE_LABEL[u.role]} · tu cuenta</span>
                    ) : (
                      <form action={setUserRole} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <label htmlFor={`role-${u.id}`} className="sr-only">
                          Rol de {u.full_name || "este usuario"}
                        </label>
                        <select id={`role-${u.id}`} name="role" defaultValue={u.role} className="field min-h-10 w-auto py-1">
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="btn btn-secondary min-h-10 px-4 text-[14px]" pending="Aplicando…">
                          Cambiar rol
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title={term ? `Nadie coincide con «${term}».` : "No hay usuarios con este rol."}
            body={term ? "Revisa la ortografía o busca solo por un apellido." : "Para dar el rol Abogado o Administrador, busca a la persona en «Todos» y cámbialo."}
            action={{ href: "/admin/usuarios", label: "Ver todos" }}
          />
        )}
      </div>
      <p className="mt-4 max-w-[70ch] text-[13px] text-ink-soft">
        Para que un abogado vea sus casos, dale el rol Abogado aquí y luego vincula su cuenta desde su perfil en Abogados.
      </p>
    </>
  );
}
