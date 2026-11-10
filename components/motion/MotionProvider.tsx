"use client";

import { useEffect, useRef } from "react";
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
 * El visitante puede reducirlas con el interruptor del pie de página o del menú móvil; la elección
 * se guarda en localStorage ("reduce" | "full"). Si nunca eligió y su sistema pide reducir
 * movimiento, se arranca reducido. El script de arranque pone la clase .reduce-motion en <html>.
 */
export const reducedMotion = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion");

/** Curva de salida de la firma (cercana a cubic-bezier(0.23, 1, 0.32, 1)). */
const EASE_OUT = "expo.out";

/** Separa lo que ya pasó hacia arriba (se muestra sin animar) de lo que entra ahora. */
function splitPassed(batch: Element[]) {
  const passed = batch.filter((el) => el.getBoundingClientRect().bottom < window.innerHeight * 0.4);
  return { passed, fresh: batch.filter((el) => !passed.includes(el)) };
}

const imgOf = (fig: Element) => fig.querySelector("img");

/** Texto [data-reveal]: sube y aparece, escalonado por grupo. */
function showText(batch: Element[]) {
  const { passed, fresh } = splitPassed(batch);
  if (passed.length) gsap.set(passed, { opacity: 1, y: 0, overwrite: true });
  // Leve retraso: el título entra primero palabra por palabra, luego el texto.
  if (fresh.length) gsap.to(fresh, { opacity: 1, y: 0, duration: 0.5, ease: EASE_OUT, delay: 0.06, stagger: 0.06, overwrite: true });
}

/** Fotos [data-media]: máscara que se abre desde abajo mientras la imagen se asienta. */
function showMedia(batch: Element[]) {
  const { passed, fresh } = splitPassed(batch);
  if (passed.length) gsap.set(passed, { clipPath: "inset(0% 0% 0% 0%)", overwrite: true });
  fresh.forEach((fig, i) => {
    const delay = 0.1 + i * 0.08;
    gsap.fromTo(
      fig,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.5,
        ease: "power3.inOut",
        delay,
        overwrite: true,
        onStart: () => gsap.set(fig, { willChange: "clip-path" }),
        onComplete: () => gsap.set(fig, { clearProps: "willChange" }),
      },
    );
    const img = imgOf(fig);
    if (img) gsap.fromTo(img, { scale: 1.14 }, { scale: 1.06, duration: 0.5, ease: EASE_OUT, delay });
  });
}

/**
 * Registro de entradas: cada nodo [data-reveal] / [data-media] se registra una sola vez, también
 * los que llegan tarde (contenido que reemplaza al esqueleto de loading.tsx). Así nada queda oculto.
 * scan() devuelve true si registró nodos nuevos (para recalcular posiciones una sola vez).
 */
function createRevealer() {
  const seen = new WeakSet<Element>();
  const kills: { kill: () => void }[] = [];
  const fresh = (sel: string) => gsap.utils.toArray<HTMLElement>(sel).filter((el) => !seen.has(el));

  const scan = () => {
    const text = fresh("[data-reveal]");
    const media = fresh("[data-media]");
    if (!text.length && !media.length) return false;
    [...text, ...media].forEach((el) => seen.add(el));
    if (reducedMotion()) {
      // Las fotos ya se ven por CSS (.reduce-motion); el texto se muestra sin movimiento.
      gsap.set(text, { opacity: 1, y: 0 });
      return false;
    }
    if (text.length) kills.push(...ScrollTrigger.batch(text, { start: "top 96%", once: true, onEnter: showText, onEnterBack: showText }));
    media.forEach((fig) => {
      const img = imgOf(fig);
      if (!img) return;
      // Parallax suave: la imagen es 6 % más grande que su marco y se desplaza ±2 % con el scroll (solo transform).
      gsap.set(img, { scale: 1.06 });
      kills.push(
        gsap.fromTo(
          img,
          { yPercent: -2 },
          { yPercent: 2, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } },
        ),
      );
    });
    if (media.length) kills.push(...ScrollTrigger.batch(media, { start: "top 88%", once: true, onEnter: showMedia, onEnterBack: showMedia }));
    return true;
  };

  return { scan, destroy: () => kills.forEach((k) => k.kill()) };
}

/**
 * Scroll suave (Lenis) sincronizado con ScrollTrigger + entradas globales:
 * todo elemento [data-reveal] sube y aparece al entrar en pantalla, escalonado por grupo;
 * toda foto [data-media] se abre con máscara y tiene parallax suave.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Atrás / Adelante: el navegador restaura el scroll; no hay que mandarlo arriba.
  const fromHistory = useRef(false);

  useEffect(() => {
    window.__motionReady = true;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
    const onPop = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    if (reducedMotion()) return () => window.removeEventListener("popstate", onPop);
    const lenis = new Lenis({ lerp: 0.18, smoothWheel: true, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      window.removeEventListener("popstate", onPop);
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  useEffect(() => {
    const lenis = window.__lenis;
    let syncFrame = 0;
    if (fromHistory.current) {
      // Next restaura la posición tras pintar: Lenis la adopta en vez de pelearla.
      fromHistory.current = false;
      syncFrame = requestAnimationFrame(() => {
        syncFrame = requestAnimationFrame(() => {
          lenis?.resize();
          lenis?.scrollTo(window.scrollY, { immediate: true });
        });
      });
    } else {
      lenis?.scrollTo(0, { immediate: true });
    }

    const revealer = createRevealer();
    // Un solo recálculo de posiciones, agrupado: nada de ráfagas de ScrollTrigger.refresh().
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    if (revealer.scan()) scheduleRefresh();
    // Contenido en streaming (esqueleto → página): registrar lo que aparezca, una vez por cuadro.
    let scanFrame = 0;
    const observer = new MutationObserver(() => {
      if (scanFrame) return;
      scanFrame = requestAnimationFrame(() => {
        scanFrame = 0;
        if (revealer.scan()) scheduleRefresh();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Las fuentes y las imágenes cambian alturas.
    let alive = true;
    document.fonts?.ready.then(() => alive && scheduleRefresh());
    const onLoad = () => scheduleRefresh();
    if (document.readyState !== "complete") window.addEventListener("load", onLoad, { once: true });

    return () => {
      alive = false;
      observer.disconnect();
      cancelAnimationFrame(scanFrame);
      cancelAnimationFrame(syncFrame);
      clearTimeout(refreshTimer);
      window.removeEventListener("load", onLoad);
      revealer.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
