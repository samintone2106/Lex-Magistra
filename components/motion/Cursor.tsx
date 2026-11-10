"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { reducedMotion } from "./MotionProvider";

/**
 * Cursor propio: un punto que crece sobre elementos interactivos. Solo en desktop con mouse.
 * Apagado por defecto (se usa el cursor nativo, que no compite con el del visitante);
 * para activarlo: <Cursor enabled />.
 */
export function Cursor({ enabled = false }: { enabled?: boolean }) {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!enabled || !el || reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    el.style.display = "block";
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    // Solo se anima la escala cuando cambia el estado (no en cada movimiento del mouse).
    let hover = false;
    const size = (pressed = false) => (hover ? 3.2 : 1) * (pressed ? 0.75 : 1);
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const interactive = !!(e.target as HTMLElement).closest("a,button,[role=button],input,select,textarea,label");
      if (interactive === hover) return;
      hover = interactive;
      gsap.to(el, { scale: size(), duration: 0.25, ease: "power3.out", overwrite: "auto" });
    };
    const down = () => gsap.to(el, { scale: size(true), duration: 0.12, ease: "power3.out", overwrite: "auto" });
    const up = () => gsap.to(el, { scale: size(), duration: 0.2, ease: "power3.out", overwrite: "auto" });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[6px] -mt-[6px] hidden h-3 w-3 rounded-full bg-mist mix-blend-difference"
    />
  );
}
