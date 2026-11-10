"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { IMAGES } from "@/lib/content/credits";
import { reducedMotion } from "@/components/motion/MotionProvider";
import { Magnetic } from "@/components/motion/Magnetic";

gsap.registerPlugin(ScrollTrigger, SplitText);

const STAGES = [
  { img: IMAGES.palacio, caption: "Palacio de Justicia, Bogotá", ground: "#1A1B1D" },
  { img: IMAGES.capitolio, caption: "Capitolio Nacional, Bogotá", ground: "#212B41" },
  { img: IMAGES.columnas, caption: "Columnas corintias", ground: "#1E2127" },
  { img: IMAGES.candelaria, caption: "La Candelaria, Bogotá", ground: "#212B41" },
  { img: IMAGES.placa, caption: "Plaza de Bolívar, Bogotá", ground: "#1A1B1D" },
];

/** Recorrido de scroll por cada foto de la historia fija (corto: el visitante no siente que se atasca). */
const STAGE_SVH = 38;

interface Props {
  advisorHref: string;
  advisorExternal: boolean;
}

/**
 * Firma del sitio: el título queda fijo mientras pasan, una tras otra, fotografías de la arquitectura
 * de la justicia colombiana; cada una trae su propio fondo. El scroll de la página manda (nada secuestrado).
 */
export function Hero({ advisorHref, advisorExternal }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const title = el.querySelector<HTMLElement>("[data-hero-title]")!;
      if (reducedMotion()) return;
      // Entrada. El título, el texto y la primera foto ya se ven desde el primer pintado:
      // las palabras solo se esconden tras su máscara si la cortina del preloader todavía las tapa.
      // Si JS llegó tarde (o no hay cortina), se asientan con un leve desplazamiento, sin desaparecer.
      const curtain = !document.documentElement.classList.contains("no-intro") && performance.now() < 700;
      const intro = gsap.timeline({ delay: curtain ? 0.6 : 0 });
      if (curtain) {
        const split = SplitText.create(title, { type: "lines,words", mask: "lines" });
        intro.from(split.words, { yPercent: 115, rotate: 5, duration: 1.3, ease: "expo.out", stagger: 0.07 });
      } else {
        intro.from(title, { y: 14, duration: 0.9, ease: "expo.out" });
      }
      intro
        .from("[data-hero-photo='0'] img", { scale: 1.12, duration: 1.6, ease: "expo.out" }, 0)
        .from("[data-hero-foot] > *", { y: 24, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 0.3);

      // Salida hacia la presentación: al soltarse la escena fija, todo retrocede y se apaga
      // mientras la sección siguiente sube por encima (transform y opacidad, ligado al scroll).
      gsap.to("[data-hero-exit]", {
        scale: 0.92,
        yPercent: 6,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: el, start: "bottom bottom", end: "bottom top", scrub: true },
      });

      // Historia fija: cada foto siguiente se abre desde abajo y el fondo cambia.
      const photos = gsap.utils.toArray<HTMLElement>("[data-hero-photo]");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          // Capas de GPU solo mientras la historia está en pantalla (y solo las fotos que cambian).
          onToggle: (self) => gsap.set(photos.slice(1), { willChange: self.isActive ? "clip-path" : "auto" }),
          onUpdate: (self) => {
            const count = el.querySelector("[data-hero-count]");
            const idx = Math.min(STAGES.length, Math.round(self.progress * (STAGES.length - 1)) + 1);
            if (count) count.textContent = `${idx} / ${STAGES.length}`;
          },
        },
      });
      photos.slice(1).forEach((p, i) => {
        // La foto nueva se abre desde abajo y se asienta; la anterior queda debajo, intacta.
        tl.fromTo(p, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, i)
          .fromTo(p.querySelector("img"), { scale: 1.3, yPercent: 8 }, { scale: 1, yPercent: 0, ease: "power2.out", duration: 1 }, i)
          .to("[data-hero-stage]", { backgroundColor: STAGES[i + 1].ground, ease: "none", duration: 1 }, i);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-hero-section aria-labelledby="hero-title" className="relative" style={{ height: `${100 + (STAGES.length - 1) * STAGE_SVH}svh` }}>
      <div data-hero-stage className="sticky top-0 h-[100svh] overflow-hidden bg-carbon">
        <div data-hero-exit className="absolute inset-0 origin-[50%_30%]">
          {/* Fotos: retrato 2:3 centrado, de 90px bajo el borde superior hasta el fondo */}
          <div className="absolute inset-x-[var(--margin)] bottom-0 top-[96px] mx-auto w-auto max-w-none md:left-1/2 md:right-auto md:w-[min(46vw,720px)] md:-translate-x-1/2">
            {STAGES.map((s, i) => (
              <figure
                key={s.img.src}
                data-hero-photo={i}
                className="duotone absolute inset-0"
                style={i > 0 ? { clipPath: "inset(100% 0 0 0)" } : undefined}
              >
                <Image
                  src={s.img.src}
                  alt={s.caption}
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? "high" : "low"}
                  quality={70}
                  sizes="(min-width: 768px) 46vw, 100vw"
                  className="object-cover"
                />
                <figcaption className="absolute left-3 top-3 z-10 bg-carbon/70 px-2 py-1 text-[13px] text-ink">{s.caption}</figcaption>
              </figure>
            ))}
          </div>
  
          {/* Móvil: velos neutros bajo el título y el pie para que el texto se lea sobre cualquier foto. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[58%] bg-gradient-to-b from-carbon/90 via-carbon/60 to-transparent md:hidden" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[45%] bg-gradient-to-t from-carbon via-carbon/80 to-transparent md:hidden" />

          {/* Título fijo encima de las fotos */}
          <div className="pointer-events-none absolute inset-x-0 top-[clamp(120px,22vh,220px)] z-10 frame">
            <h1
              id="hero-title"
              data-hero-title
              className="font-display text-center text-[clamp(48px,12.5vw,80px)] leading-[0.92] text-ink md:text-[clamp(64px,8.2vw,150px)]"
            >
              <span className="block md:whitespace-nowrap">Defendemos tus derechos.</span>{" "}
              <span className="block md:whitespace-nowrap">Construimos soluciones.</span>
            </h1>
          </div>
  
          <div
            data-hero-foot
            className="absolute inset-x-0 bottom-0 z-20 frame flex flex-col gap-5 pb-8 md:flex-row md:items-end md:justify-between"
          >
            <p className="max-w-[34ch] bg-carbon/0 text-[17px] font-medium leading-snug text-ink md:max-w-[30ch]">
              Soluciones jurídicas estratégicas, profesionales y personalizadas para proteger tus intereses y
              acompañarte en cada decisión.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span data-hero-count className="hidden text-[14px] text-ink-soft tabular-nums md:inline" aria-hidden>
                1 / {STAGES.length}
              </span>
              <Link href="/especialidades" className="btn btn-secondary">
                Conoce nuestras especialidades
              </Link>
              <Magnetic>
                {advisorExternal ? (
                  <a href={advisorHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Habla con un asesor
                  </a>
                ) : (
                  <Link href={advisorHref} className="btn btn-primary">
                    Habla con un asesor
                  </Link>
                )}
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
