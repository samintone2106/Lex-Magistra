import Image from "next/image";
import Link from "next/link";
import type { LawyerWithRelations } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Retrato: la foto real del abogado o, si no la hay, sus iniciales en grande (nunca una foto de stock). */
export function LawyerPortrait({ lawyer, sizes = "(min-width:1024px) 25vw, 50vw", priority = false }: { lawyer: LawyerWithRelations; sizes?: string; priority?: boolean }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-navy">
      {lawyer.photo_url ? (
        <Image src={lawyer.photo_url} alt={`Fotografía de ${lawyer.full_name}`} fill sizes={sizes} priority={priority} className="object-cover grayscale transition-[filter,transform] duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04] group-hover:grayscale-0" />
      ) : (
        <div aria-hidden className="font-display grid h-full place-items-center text-[clamp(64px,8vw,120px)] text-mist">
          {initials(lawyer.full_name)}
        </div>
      )}
    </div>
  );
}

export function LawyerCard({ lawyer, selectHref }: { lawyer: LawyerWithRelations; selectHref?: string }) {
  return (
    <article className="group relative flex flex-col" data-reveal>
      <LawyerPortrait lawyer={lawyer} />
      <div className="flex flex-1 flex-col gap-1 pt-4">
        <h3 className="text-[19px] font-semibold leading-tight">
          <Link href={`/abogados/${lawyer.id}`} className="after:absolute after:inset-0 hover:text-mist">
            {lawyer.full_name}
          </Link>
        </h3>
        <p className="text-[15px] text-ink-soft">
          {lawyer.title}
          {lawyer.firm ? ` · ${lawyer.firm.name}` : ""}
        </p>
        <p className="text-[15px] text-ink-soft">{lawyer.specialties.map((s) => s.short_name).join(" · ")}</p>
        <p className="mt-1 text-[14px] text-mist">{lawyer.accepts_consultations ? lawyer.availability : "Sin cupo para nuevas consultas"}</p>
        {selectHref ? (
          <Link href={selectHref} className="btn btn-secondary relative z-10 mt-3 self-start">
            Solicitar asesoría
          </Link>
        ) : null}
      </div>
    </article>
  );
}
