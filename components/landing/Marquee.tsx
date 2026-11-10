"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

/** Cinta de especialidades: corre sola, sigue el sentido del scroll y se inclina según su velocidad. */
export function Marquee({ items }: { items: { slug: string; name: string }[] }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion()) return;
    const loop = gsap.to(el, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    // Arranca lejos del inicio para poder correr hacia atrás sin topar con el tiempo 0.
    loop.totalTime(400);
    // La cinta sigue el sentido del scroll; con la velocidad acelera y se inclina, y luego vuelve sola.
    const speed = { v: 1 };
    let dir = 1;
    const apply = () => loop.timeScale(speed.v);
    const skewTo = gsap.quickTo(el, "skewX", { duration: 0.6, ease: "power3.out" });
    let settle: gsap.core.Tween | undefined;
    let unskew: gsap.core.Tween | undefined;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (self.direction) dir = self.direction;
        speed.v = dir * (1 + gsap.utils.clamp(0, 5, Math.abs(v) / 600));
        apply();
        skewTo(gsap.utils.clamp(-3, 3, -v / 400));
        settle?.kill();
        settle = gsap.to(speed, { v: dir, duration: 0.8, ease: "power2.out", onUpdate: apply });
        // Cuando el scroll se detiene, la inclinación se endereza.
        unskew?.kill();
        unskew = gsap.delayedCall(0.12, () => skewTo(0));
      },
    });
    return () => {
      settle?.kill();
      unskew?.kill();
      loop.kill();
      st.kill();
      gsap.set(el, { clearProps: "transform" });
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
            className="font-display text-[clamp(48px,8vw,128px)] leading-none text-mist transition-colors duration-200 ease-[var(--ease-out)] hover:text-ink focus-visible:text-ink"
          >
            {s.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
