import Link from "next/link";
import { getLawyers, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { LawyerCard } from "@/components/site/LawyerCard";

export default async function PanelAbogados({ searchParams }: { searchParams: Promise<{ especialidad?: string }> }) {
  const { especialidad } = await searchParams;
  const [specialties, lawyers] = await Promise.all([getSpecialties(), getLawyers(especialidad || undefined)]);
  const chip = (on: boolean) => `inline-flex min-h-10 items-center px-3 text-[14px] ${on ? "bg-mist text-navy" : "bg-graphite hover:bg-navy"}`;
  return (
    <>
      <PanelTitle title="Explorar abogados" lead="Filtra por especialidad, revisa perfiles y solicita asesoría con quien prefieras." />
      <nav aria-label="Filtrar por especialidad" className="mb-8 flex flex-wrap gap-2">
        <Link href="/panel/abogados" className={chip(!especialidad)}>
          Todas
        </Link>
        {specialties.map((s) => (
          <Link key={s.slug} href={`/panel/abogados?especialidad=${s.slug}`} className={chip(especialidad === s.slug)}>
            {s.short_name}
          </Link>
        ))}
      </nav>
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
        <div className="bg-graphite p-8">
          <p className="text-[17px]">No hay perfiles publicados {especialidad ? "en esta especialidad" : "todavía"}.</p>
          <p className="mt-1 text-[15px] text-ink-soft">Puedes enviar tu solicitud y la firma asignará al profesional.</p>
          <Link href={`/panel/nueva-solicitud${especialidad ? `?especialidad=${especialidad}` : ""}`} className="btn btn-primary mt-5">
            Nueva solicitud
          </Link>
        </div>
      )}
    </>
  );
}
