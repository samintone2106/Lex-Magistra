import { getLawyers, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { LawyerCard } from "@/components/site/LawyerCard";
import { FilterTabs } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/States";

export default async function PanelAbogados({ searchParams }: { searchParams: Promise<{ especialidad?: string }> }) {
  const { especialidad } = await searchParams;
  const [specialties, lawyers] = await Promise.all([getSpecialties(), getLawyers(especialidad || undefined)]);
  const current = specialties.find((s) => s.slug === especialidad);
  const open = lawyers.filter((l) => l.accepts_consultations).length;

  return (
    <>
      <PanelTitle
        title="Explorar abogados"
        lead={
          lawyers.length
            ? `${lawyers.length} ${lawyers.length === 1 ? "perfil" : "perfiles"}${current ? ` en ${current.short_name.toLowerCase()}` : ""}, ${open} con cupo para nuevas consultas. Elige uno para empezar tu solicitud con esa persona.`
            : "Revisa perfiles y solicita asesoría con quien prefieras."
        }
      />
      <FilterTabs
        label="Filtrar por especialidad"
        items={[
          { href: "/panel/abogados", label: "Todas", active: !especialidad },
          ...specialties.map((s) => ({ href: `/panel/abogados?especialidad=${s.slug}`, label: s.short_name, active: especialidad === s.slug })),
        ]}
      />
      <div className="mt-8">
        {lawyers.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {lawyers.map((l) => {
              const s = especialidad || l.specialties[0]?.slug || "";
              return (
                <LawyerCard
                  key={l.id}
                  lawyer={l}
                  selectHref={l.accepts_consultations ? `/panel/nueva-solicitud?especialidad=${s}&abogado=${l.id}` : undefined}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={`No hay perfiles publicados ${current ? `en ${current.short_name.toLowerCase()}` : "todavía"}.`}
            body="Puedes enviar tu solicitud igual: la firma asignará al profesional más adecuado para tu caso."
            action={{ href: `/panel/nueva-solicitud${especialidad ? `?especialidad=${especialidad}` : ""}`, label: "Enviar solicitud" }}
            secondary={especialidad ? { href: "/panel/abogados", label: "Ver todas las áreas" } : undefined}
          />
        )}
      </div>
    </>
  );
}
