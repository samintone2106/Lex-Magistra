"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

/** Número que cuenta desde 0 al entrar en pantalla. Sin JS muestra el valor final. */
export function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: to,
      duration: 1.8,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = String(Math.round(obj.v));
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => {
      tween.kill();
    };
  }, [to]);
  return (
    <span ref={ref} className="tabular-nums">
      {to}
    </span>
  );
}
