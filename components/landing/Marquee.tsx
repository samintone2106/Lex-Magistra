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
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity() / 300;
        gsap.to(loop, { timeScale: gsap.utils.clamp(-6, 6, v === 0 ? 1 : v), duration: 0.4, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.4 });
      },
    });
    return () => {
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
