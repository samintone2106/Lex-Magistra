"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __motionReady?: boolean;
    __lenis?: Lenis;
  }
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll suave (Lenis) sincronizado con ScrollTrigger + entradas globales:
 * todo elemento [data-reveal] sube y aparece al entrar en pantalla, escalonado por grupo.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.__motionReady = true;
    if (reducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (reducedMotion()) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }
    const triggers = ScrollTrigger.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          overwrite: true,
        }),
    });
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      clearTimeout(refresh);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return <>{children}</>;
}
