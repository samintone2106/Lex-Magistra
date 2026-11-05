"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import { Monogram } from "./Monogram";
import { Magnetic } from "@/components/motion/Magnetic";
import { reducedMotion } from "@/components/motion/MotionProvider";

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/abogados", label: "Nuestros abogados" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/opiniones", label: "Opiniones" },
  { href: "/contacto", label: "Contacto" },
];

interface Props {
  firmName: string;
  signedIn: boolean;
  isAdmin: boolean;
}

export function Nav({ firmName, signedIn, isAdmin }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // Se esconde al bajar, vuelve al subir.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 240 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menú móvil: cortina + enlaces escalonados.
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    if (!open || reducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "expo.inOut" });
    tl.from(el.querySelectorAll("[data-menu-item]"), { yPercent: 120, opacity: 0, stagger: 0.05, duration: 0.7, ease: "expo.out" }, "-=0.25");
    return () => {
      tl.kill();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const panelHref = isAdmin ? "/admin" : "/panel";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-[var(--ease-out)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${solid ? "bg-carbon" : "bg-transparent"}`}
      >
        <nav aria-label="Principal" className="frame flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 text-ink" aria-label={`${firmName}, inicio`}>
            <Monogram className="h-8 w-8" />
            <span className="text-[15px] font-semibold tracking-tight">{firmName}</span>
          </Link>

          <ul className="hidden items-center gap-7 xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`group relative py-2 text-[15px] transition-colors ${
                    isActive(l.href) ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                  <span
                    aria-hidden
                    className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-mist transition-transform duration-300 ease-[var(--ease-out)] ${
                      isActive(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 xl:flex">
            <Link href="/panel/nueva-solicitud" className="btn btn-ghost">
              Consultar con un abogado
            </Link>
            <Magnetic>
              <Link href={signedIn ? panelHref : "/ingresar"} className="btn btn-primary">
                {signedIn ? "Mi panel" : "Iniciar sesión"}
              </Link>
            </Magnetic>
          </div>

          <button
            type="button"
            className="btn btn-ghost xl:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
            <span>{open ? "Cerrar" : "Menú"}</span>
          </button>
        </nav>
      </header>

      <div
        id="menu-movil"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-navy px-[var(--margin)] pb-8 pt-28 xl:hidden"
      >
        <ul className="space-y-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href} className="overflow-hidden">
              <Link
                data-menu-item
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="font-display block py-1 text-[clamp(40px,11vw,72px)] text-ink transition-colors hover:text-mist"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 grid gap-3 sm:grid-cols-2" data-menu-item>
          <Link href="/panel/nueva-solicitud" className="btn btn-secondary">
            Consultar con un abogado
          </Link>
          <Link href={signedIn ? panelHref : "/ingresar"} className="btn btn-primary">
            {signedIn ? "Mi panel" : "Iniciar sesión"}
          </Link>
        </div>
      </div>
    </>
  );
}
