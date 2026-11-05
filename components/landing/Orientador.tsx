"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import type { Specialty } from "@/lib/types";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import { reducedMotion } from "@/components/motion/MotionProvider";

/**
 * Lo interactivo de la página: el visitante elige lo que le pasa y ve qué área lo atiende,
 * con los servicios concretos y el siguiente paso. Funciona con el pulgar; sin JS, los enlaces llevan a cada área.
 */
export function Orientador({ specialties }: { specialties: Specialty[] }) {
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const s = specialties[active];

  const choose = (i: number) => {
    if (i === active) return;
    setActive(i);
    const el = panel.current;
    if (el && !reducedMotion()) {
      gsap.fromTo(
        el.querySelectorAll("[data-o]"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.05, overwrite: true },
      );
    }
  };

  if (!s) return null;

  return (
    <section aria-labelledby="orientador-title" className="bg-navy py-[var(--section-gap)]">
      <div className="frame grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="orientador-title" data-reveal className="font-display text-[clamp(40px,4.6vw,72px)]">
            ¿Qué necesitas resolver?
          </h2>
          <p data-reveal className="mt-6 max-w-[42ch] text-[17px] text-ink-soft">
            Elige la situación que más se parece a la tuya y te mostramos el área que la atiende.
          </p>
          <ul className="mt-10 flex flex-col" role="listbox" aria-label="Situaciones">
            {specialties.map((sp, i) => (
              <li key={sp.slug} data-reveal>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onClick={() => choose(i)}
                  className={`w-full py-3 text-left text-[18px] leading-snug transition-[color,padding] duration-300 ease-[var(--ease-out)] ${
                    i === active ? "pl-4 text-ink" : "text-ink-soft hover:pl-2 hover:text-ink"
                  }`}
                >
                  {sp.problems[0]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div ref={panel} aria-live="polite" className="flex flex-col bg-carbon p-8 lg:col-span-6 lg:col-start-7 lg:p-12">
          <div data-o className="text-mist">
            <SpecialtyIcon name={s.icon} size={40} />
          </div>
          <h3 data-o className="font-display mt-6 text-[clamp(36px,3.6vw,56px)] leading-none">
            {s.name}
          </h3>
          <p data-o className="mt-5 max-w-[48ch] text-[17px] text-ink-soft">
            {s.summary}
          </p>
          <ul data-o className="mt-8 grid gap-2 text-[17px]">
            {s.services.map((sv) => (
              <li key={sv} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] h-2 w-2 shrink-0 bg-mist" />
                {sv}
              </li>
            ))}
          </ul>
          <div data-o className="mt-auto flex flex-wrap gap-3 pt-10">
            <Link href={`/panel/nueva-solicitud?especialidad=${s.slug}`} className="btn btn-primary">
              Solicitar asesoría
            </Link>
            <Link href={`/especialidades/${s.slug}`} className="btn btn-secondary">
              Ver el área completa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
