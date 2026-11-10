import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isOwnPublicUrl } from "@/lib/storage-url";
import { deleteLawyer } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { FilterTabs, Initials } from "@/components/ui/Panel";
import { BlockError, EmptyState, Notice } from "@/components/ui/States";

const OK: Record<string, string> = { creado: "Perfil creado.", editado: "Perfil actualizado.", eliminado: "Perfil eliminado." };

type Row = {
  id: string;
  full_name: string;
  title: string;
  photo_url: string | null;
  is_active: boolean;
  accepts_consultations: boolean;
  profile_id: string | null;
  firm: { name: string } | null;
  lawyer_specialties: { specialty: { short_name: string } | null }[];
};

const VIEWS = [
  { key: "", label: "Todos", match: () => true },
  { key: "publicados", label: "Publicados", match: (l: Row) => l.is_active },
  { key: "ocultos", label: "Ocultos", match: (l: Row) => !l.is_active },
  { key: "sin-cupo", label: "Sin cupo", match: (l: Row) => !l.accepts_consultations },
];

export default async function AdminAbogados({ searchParams }: { searchParams: Promise<{ ok?: string; vista?: string }> }) {
  const { ok, vista } = await searchParams;
  const view = VIEWS.find((v) => v.key === (vista ?? "")) ?? VIEWS[0];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lawyers")
    .select("id,full_name,title,photo_url,is_active,accepts_consultations,profile_id, firm:firms(name), lawyer_specialties(specialty:specialties(short_name))")
    .order("full_name");
  const all = (data ?? []) as unknown as Row[];
  const rows = all.filter(view.match);
  const published = all.filter((l) => l.is_active).length;

  return (
    <>
      <PanelTitle
        title="Abogados"
        lead={all.length ? `${all.length} ${all.length === 1 ? "perfil" : "perfiles"}, ${published} publicado${published === 1 ? "" : "s"} en el sitio. Los clientes solo pueden elegir perfiles publicados y con cupo.` : "Crea, edita y publica los perfiles de los abogados."}
      >
        <Link href="/admin/abogados/nuevo" className="btn btn-primary">
          Nuevo abogado
        </Link>
      </PanelTitle>
      {ok && OK[ok] ? (
        <Notice tone="success" className="mb-6">
          {OK[ok]}
        </Notice>
      ) : null}

      <FilterTabs
        label="Filtrar abogados"
        items={VIEWS.map((v) => ({ href: v.key ? `/admin/abogados?vista=${v.key}` : "/admin/abogados", label: v.label, count: all.filter(v.match).length, active: v.key === view.key }))}
      />

      <div className="mt-5">
        {error ? (
          <BlockError what="los abogados" retryHref="/admin/abogados" />
        ) : rows.length ? (
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {rows.map((l) => {
              const specs = l.lawyer_specialties.map((s) => s.specialty?.short_name).filter(Boolean) as string[];
              return (
                <li key={l.id} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-3 md:grid-cols-[48px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                  {isOwnPublicUrl(l.photo_url, "lawyer-photos") ? (
                    <span className="relative block h-12 w-12 overflow-hidden bg-navy">
                      <Image src={l.photo_url} alt="" fill sizes="48px" className="object-cover grayscale" />
                    </span>
                  ) : (
                    <Initials name={l.full_name} size={48} />
                  )}
                  <div className="min-w-0">
                    <Link href={`/admin/abogados/${l.id}`} className="block truncate font-medium hover:text-mist">
                      {l.full_name}
                    </Link>
                    <span className="block truncate text-[13px] text-ink-soft">
                      {l.title}
                      {l.firm ? ` · ${l.firm.name}` : ""}
                    </span>
                  </div>
                  <p className="col-start-2 text-[14px] text-ink-soft md:col-start-auto">{specs.length ? specs.join(", ") : "Sin especialidades"}</p>
                  <p className="col-start-2 flex flex-wrap gap-x-3 gap-y-1 text-[14px] md:col-start-auto">
                    <span className={l.is_active ? "text-ink" : "text-ink-soft"}>{l.is_active ? "Publicado" : "Oculto"}</span>
                    <span className="text-ink-soft">{l.accepts_consultations ? "Recibe consultas" : "Sin cupo"}</span>
                    {l.profile_id ? <span className="text-ink-soft">Con cuenta</span> : null}
                  </p>
                  <div className="col-start-2 flex flex-wrap items-center gap-1 md:col-start-auto md:justify-end">
                    <Link href={`/admin/abogados/${l.id}`} className="btn btn-ghost min-h-10 text-[14px]">
                      Editar
                    </Link>
                    <form action={deleteLawyer}>
                      <input type="hidden" name="id" value={l.id} />
                      <ConfirmButton message={`Se borrará el perfil de ${l.full_name}.`}>Eliminar</ConfirmButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : all.length ? (
          <EmptyState title={`No hay abogados en «${view.label.toLowerCase()}».`} action={{ href: "/admin/abogados", label: "Ver todos" }} />
        ) : (
          <EmptyState
            title="Aún no hay abogados registrados."
            body="Crea el primer perfil con su foto, especialidades y experiencia. Mientras no haya perfiles, la firma asigna los casos."
            action={{ href: "/admin/abogados/nuevo", label: "Crear el primer perfil" }}
          />
        )}
      </div>
    </>
  );
}
