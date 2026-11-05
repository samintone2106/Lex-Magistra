"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { reducedMotion } from "./MotionProvider";

/** Cursor propio: un punto que crece sobre elementos interactivos. Solo en desktop con mouse. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el || reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    el.style.display = "block";
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const interactive = (e.target as HTMLElement).closest("a,button,[role=button],input,select,textarea,label");
      gsap.to(el, { scale: interactive ? 3.2 : 1, duration: 0.3, ease: "power3.out", overwrite: "auto" });
    };
    const down = () => gsap.to(el, { scale: "*=0.7", duration: 0.12 });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[6px] -mt-[6px] hidden h-3 w-3 rounded-full bg-mist mix-blend-difference"
    />
  );
}
