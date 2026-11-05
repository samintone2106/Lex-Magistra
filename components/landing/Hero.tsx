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
      if (reducedMotion()) {
        gsap.set(title, { opacity: 1 });
        return;
      }
      // Entrada: palabras desde máscara, foto que se abre, pie que sube.
      const split = SplitText.create(title, { type: "lines,words", mask: "lines" });
      gsap.set(title, { opacity: 1 });
      const intro = gsap.timeline({ delay: document.documentElement.classList.contains("no-intro") ? 0.1 : 1.2 });
      intro
        .from(split.words, { yPercent: 115, rotate: 5, duration: 1.3, ease: "expo.out", stagger: 0.07 })
        .from("[data-hero-photo='0']", { clipPath: "inset(100% 0 0 0)", scale: 1.25, duration: 1.6, ease: "expo.out" }, 0.1)
        .from("[data-hero-foot] > *", { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1 }, 0.5);

      // Historia fija: cada foto siguiente se abre desde abajo y el fondo cambia.
      const photos = gsap.utils.toArray<HTMLElement>("[data-hero-photo]");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
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
    <section ref={root} data-hero-section aria-labelledby="hero-title" className="relative" style={{ height: `${100 + (STAGES.length - 1) * 55}svh` }}>
      <div data-hero-stage className="sticky top-0 h-[100svh] overflow-hidden bg-carbon">
        {/* Fotos: retrato 2:3 centrado, de 90px bajo el borde superior hasta el fondo */}
        <div className="absolute inset-x-[var(--margin)] bottom-0 top-[96px] mx-auto w-auto max-w-none md:left-1/2 md:right-auto md:w-[min(46vw,720px)] md:-translate-x-1/2">
          {STAGES.map((s, i) => (
            <figure
              key={s.img.src}
              data-hero-photo={i}
              className="duotone absolute inset-0 will-change-[clip-path,transform]"
              style={i > 0 ? { clipPath: "inset(100% 0 0 0)" } : undefined}
            >
              <Image
                src={s.img.src}
                alt={s.caption}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 46vw, 100vw"
                className="object-cover"
              />
              <figcaption className="absolute left-3 top-3 z-10 bg-carbon/70 px-2 py-1 text-[13px] text-ink">{s.caption}</figcaption>
            </figure>
          ))}
        </div>

        {/* Título fijo encima de las fotos */}
        <div className="pointer-events-none absolute inset-x-0 top-[clamp(120px,22vh,220px)] z-10 frame">
          <h1
            id="hero-title"
            data-hero-title
            className="font-display text-center text-[clamp(48px,12.5vw,80px)] leading-[0.92] text-ink opacity-0 md:text-[clamp(64px,8.2vw,150px)] [.js-fallback_&]:opacity-100"
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
    </section>
  );
}
