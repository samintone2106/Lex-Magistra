"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

/** Cinta de especialidades: corre sola y acelera / invierte según la velocidad del scroll. */
export function Marquee({ items }: { items: { slug: string; name: string }[] }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion()) return;
    const loop = gsap.to(el, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    // Una sola animación de velocidad reutilizada: acelera con el scroll y vuelve a 1 sola.
    const speed = { v: 1 };
    const apply = () => loop.timeScale(speed.v);
    let settle: gsap.core.Tween | undefined;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        speed.v = 1 + gsap.utils.clamp(0, 5, Math.abs(self.getVelocity()) / 600);
        apply();
        settle?.kill();
        settle = gsap.to(speed, { v: 1, duration: 0.8, ease: "power2.out", onUpdate: apply });
      },
    });
    return () => {
      settle?.kill();
      loop.kill();
      st.kill();
    };
  }, []);

  const row = [...items, ...items];
  return (
    <section aria-label="Áreas de práctica" className="overflow-hidden bg-navy py-10 md:py-14">
      <div ref={track} className="flex w-max gap-[6vw] whitespace-nowrap">
        {row.map((s, i) => (
          <Link
            key={`${s.slug}-${i}`}
            href={`/especialidades/${s.slug}`}
            tabIndex={i >= items.length ? -1 : undefined}
            aria-hidden={i >= items.length ? true : undefined}
            className="font-display text-[clamp(48px,8vw,128px)] leading-none text-mist transition-colors duration-300 hover:text-ink"
          >
            {s.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
