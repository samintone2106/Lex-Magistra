"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// Si se baja rápido y una animación ligada al scroll queda atrás, se completa al instante.
ScrollTrigger.defaults({ fastScrollEnd: true });

declare global {
  interface Window {
    __motionReady?: boolean;
    __lenis?: Lenis;
  }
}

/**
 * Animaciones activas por defecto (decisión de la firma: el sitio se luce con movimiento).
 * El visitante puede reducirlas con el interruptor del pie de página; la elección se guarda
 * en localStorage y el script de arranque pone la clase .reduce-motion en <html>.
 */
export const reducedMotion = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion");

/**
 * Scroll suave (Lenis) sincronizado con ScrollTrigger + entradas globales:
 * todo elemento [data-reveal] sube y aparece al entrar en pantalla, escalonado por grupo.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.__motionReady = true;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
    if (reducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.9 });
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
    const show = (batch: Element[]) => {
      // Lo que ya quedó arriba (scroll rápido) aparece sin animar: nunca contenido a medias.
      const passed = batch.filter((el) => el.getBoundingClientRect().bottom < window.innerHeight * 0.4);
      const fresh = batch.filter((el) => !passed.includes(el));
      if (passed.length) gsap.set(passed, { opacity: 1, y: 0, overwrite: true });
      if (fresh.length) gsap.to(fresh, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, overwrite: true });
    };
    const triggers = ScrollTrigger.batch(els, {
      start: "top 96%",
      once: true,
      onEnter: show,
      onEnterBack: show,
    });
    // Las fuentes y las imágenes cambian alturas: recalcular posiciones de los disparadores.
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 300);
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return <>{children}</>;
}
