"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import type { Specialty } from "@/lib/types";
import { SPECIALTY_IMAGE, IMAGES } from "@/lib/content/credits";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { reducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop: la sección se fija y las seis especialidades cruzan en horizontal mientras se baja.
 * Cada tarjeta tiene inclinación 3D y un foco que sigue al cursor. Móvil: lista vertical.
 */
export function SpecialtiesRail({ specialties }: { specialties: Specialty[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || reducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      // Las fotos se desplazan dentro de su marco (parallax horizontal).
      gsap.utils.toArray<HTMLElement>("[data-rail-img]").forEach((img) => {
        gsap.fromTo(img, { xPercent: -12 }, {
          xPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  // Inclinación 3D + foco
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reducedMotion()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gsap.to(card, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 8, duration: 0.5, ease: "power3.out" });
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });

  return (
    <section ref={section} id="especialidades" aria-labelledby="esp-title" className="relative overflow-hidden bg-carbon">
      <div className="flex min-h-[100svh] flex-col justify-center py-24 lg:py-0">
        <div className="frame mb-10 grid gap-6 lg:mb-12 lg:grid-cols-12">
          <SplitHeading id="esp-title" className="font-display text-[clamp(44px,6vw,96px)] lg:col-span-7">
            Especialidades jurídicas
          </SplitHeading>
          <p data-reveal className="max-w-[44ch] text-[17px] text-ink-soft lg:col-span-4 lg:col-start-9 lg:self-end">
            Seis áreas, un mismo método: escuchar el caso completo, explicar el derecho con claridad y actuar con
            una estrategia definida.
          </p>
        </div>

        <div ref={track} className="frame flex flex-col gap-4 lg:w-max lg:flex-row lg:gap-6 lg:pr-[30vw]">
          {specialties.map((s) => {
            const img = SPECIALTY_IMAGE[s.slug] ?? IMAGES.columnas;
            return (
              <article
                key={s.slug}
                data-reveal
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="group relative flex flex-col bg-graphite [transform-style:preserve-3d] [perspective:900px] lg:h-[64vh] lg:w-[min(36vw,520px)]"
              >
                <div className="duotone relative h-56 overflow-hidden lg:h-[52%]">
                  <div data-rail-img className="absolute inset-[-14%]">
                    <Image src={img.src} alt="" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105" />
                  </div>
                </div>
                {/* Barra que crece al pasar el cursor */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-mist transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100"
                />
                <div className="relative flex flex-1 flex-col gap-3 p-6 lg:p-8">
                  <div className="flex items-center gap-3 text-mist">
                    <SpecialtyIcon name={s.icon} size={26} />
                  </div>
                  <h3 className="font-display text-[clamp(30px,2.6vw,40px)] leading-none">{s.name}</h3>
                  <p className="text-[16px] text-ink-soft">{s.summary}</p>
                  <Link
                    href={`/especialidades/${s.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-2 text-[16px] font-medium text-ink after:absolute after:inset-0 hover:text-mist"
                  >
                    Conocer más
                    <ArrowUpRight aria-hidden size={18} className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
