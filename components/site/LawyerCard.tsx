import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LawyerWithRelations } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Retrato: la foto real del abogado o, si no la hay, sus iniciales en grande (nunca una foto de stock). */
export function LawyerPortrait({ lawyer, sizes = "(min-width:1024px) 25vw, 50vw", priority = false }: { lawyer: LawyerWithRelations; sizes?: string; priority?: boolean }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-navy">
      {lawyer.photo_url ? (
        <Image
          src={lawyer.photo_url}
          alt={`Fotografía de ${lawyer.full_name}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover grayscale transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
        />
      ) : (
        <div
          aria-hidden
          className="font-display grid h-full place-items-center text-[clamp(64px,8vw,120px)] text-mist transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-3 group-focus-within:-translate-y-3"
        >
          {initials(lawyer.full_name)}
        </div>
      )}
    </div>
  );
}

/**
 * Tarjeta del directorio. Al pasar el cursor (o enfocar con teclado) la foto se acerca
 * y sube desde abajo una franja con "Ver perfil"; toda la tarjeta es el enlace.
 */
export function LawyerCard({ lawyer, selectHref }: { lawyer: LawyerWithRelations; selectHref?: string }) {
  return (
    <article className="group relative flex flex-col" data-reveal>
      <div className="relative overflow-hidden">
        <LawyerPortrait lawyer={lawyer} />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-mist px-4 py-3 text-[16px] font-medium text-navy transition-transform duration-[240ms] ease-[var(--ease-out)] group-hover:translate-y-0 group-focus-within:translate-y-0"
        >
          Ver perfil
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-4">
        <h3 className="text-[19px] font-semibold leading-tight">
          <Link
            href={`/abogados/${lawyer.id}`}
            className="transition-colors duration-200 after:absolute after:inset-0 hover:text-mist focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-mist"
          >
            {lawyer.full_name}
          </Link>
        </h3>
        <p className="text-[16px] text-ink">
          {lawyer.title}
          {lawyer.firm ? ` · ${lawyer.firm.name}` : ""}
        </p>
        {lawyer.specialties.length ? (
          <p className="text-[16px] text-ink-soft">{lawyer.specialties.map((s) => s.short_name).join(" · ")}</p>
        ) : null}
        <p className="mt-1 text-[16px] text-mist">{lawyer.accepts_consultations ? lawyer.availability : "Sin cupo para nuevas consultas"}</p>
        {selectHref ? (
          <Link href={selectHref} className="btn btn-secondary relative z-10 mt-3 self-start">
            Solicitar asesoría
          </Link>
        ) : null}
      </div>
    </article>
  );
}
