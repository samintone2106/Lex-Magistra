"use client";

import { useEffect, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "./MotionProvider";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface Props {
  as?: ElementType;
  children: React.ReactNode;
  className?: string;
  /** "load": anima al montar (hero). "scroll": al entrar en pantalla. */
  trigger?: "load" | "scroll";
  delay?: number;
  id?: string;
}

/** Título que entra palabra por palabra desde una máscara (las letras suben desde debajo de la línea). */
export function SplitHeading({ as: Tag = "h2", children, className, trigger = "scroll", delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, { type: "words,lines", mask: "lines", linesClass: "split-line" });
      gsap.set(el, { opacity: 1 });
      gsap.from(split.words, {
        yPercent: 110,
        rotate: 4,
        duration: 0.8,
        ease: "power4.out",
        stagger: 0.05,
        delay,
        scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 95%", toggleActions: "play none none none", fastScrollEnd: true } : undefined,
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [delay, trigger]);

  return (
    <Tag ref={ref} id={id} className={className} data-split="">
      {children}
    </Tag>
  );
}
