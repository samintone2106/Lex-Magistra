"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { IMAGES } from "@/lib/content/credits";
import { SplitHeading } from "@/components/motion/SplitHeading";

const STAGES = [
  {
    name: "Nos cuentas tu caso",
    text: "Por WhatsApp, por el formulario o desde tu panel. Solo necesitamos una descripción breve y tus datos de contacto.",
    bg: "var(--carbon)",
    ink: "var(--white)",
    img: IMAGES.candelaria,
  },
  {
    name: "Revisamos y te orientamos",
    text: "Un abogado del área revisa la información y te indica, con franqueza, si el asunto tiene camino jurídico y cuál.",
    bg: "var(--graphite)",
    ink: "var(--white)",
    img: IMAGES.palacio,
  },
  {
    name: "Propuesta por escrito",
    text: "Si decides avanzar, recibes una propuesta con el alcance del servicio y los honorarios. Nada empieza sin tu aprobación.",
    bg: "var(--navy)",
    ink: "var(--white)",
    img: { src: "/img/firma.jpg" },
  },
  {
    name: "Estrategia y actuación",
    text: "Definimos la estrategia, preparamos los documentos y actuamos ante la autoridad que corresponda.",
    bg: "var(--steel)",
    ink: "var(--white)",
    img: IMAGES.escalera,
  },
  {
    name: "Seguimiento",
    text: "Consultas el estado y el historial de tu solicitud en tu panel cuando quieras.",
    bg: "var(--mist)",
    ink: "var(--navy)",
    img: IMAGES.capitolio,
  },
];

/* Escritorio: cada panel mide lo mismo que el abierto (58 %) y se superpone al anterior.
   Abrir uno solo desliza los paneles con transform: nada de animar anchos (sin re-layout). */
const OPEN = 58;
const CLOSED = 10.5;

/** Posición horizontal del panel i (en % de su propio ancho) según cuál está abierto. */
const offset = (i: number, open: number) => {
  const left = i * CLOSED + (open < i ? OPEN - CLOSED : 0);
  return `${((left / OPEN) * 100).toFixed(3)}%`;
};

/** Acordeón horizontal de paneles: de oscuro a claro, el orden lo da el tono. */
export function Process() {
  const [open, setOpen] = useState(0);

  return (
    <section aria-labelledby="proceso-title" className="bg-carbon py-[var(--section-gap)]">
      <div className="frame grid gap-6 lg:grid-cols-12">
        <SplitHeading id="proceso-title" className="font-display text-[clamp(40px,4.6vw,72px)] lg:col-span-5">
          Cómo te atendemos
        </SplitHeading>
        <p data-reveal className="max-w-[46ch] text-[18px] text-ink-soft lg:col-span-5 lg:col-start-7 lg:self-end">
          Cinco momentos, siempre en el mismo orden. Seleccionar una solicitud o un abogado no crea por sí solo una
          relación abogado-cliente: esa relación empieza cuando apruebas la propuesta.
        </p>
      </div>

      <div className="frame mt-16">
        <ol data-reveal className="flex flex-col lg:relative lg:block lg:h-[520px] lg:overflow-hidden">
          {STAGES.map((s, i) => {
            const isOpen = open === i;
            const style = { backgroundColor: s.bg, color: s.ink, zIndex: i, "--x": offset(i, open) } as CSSProperties;
            return (
              <li
                key={s.name}
                style={style}
                className="relative overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:w-[58%] lg:[transform:translateX(var(--x))] lg:transition-transform lg:duration-[450ms] lg:ease-[var(--ease-out)]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(i)}
                  className="group flex h-16 w-full items-center px-5 text-left text-[18px] font-semibold lg:absolute lg:inset-0 lg:h-full lg:items-end lg:px-6 lg:pb-6"
                >
                  <span
                    className={`whitespace-nowrap transition-[opacity,translate] duration-200 ease-[var(--ease-out)] lg:origin-bottom-left lg:-rotate-90 lg:translate-x-[1.1em] ${
                      isOpen ? "lg:opacity-0" : "lg:opacity-100 lg:group-hover:translate-y-[-6px]"
                    }`}
                  >
                    {s.name}
                  </span>
                </button>
                {isOpen ? (
                  <div className="animate-[fade-up_420ms_var(--ease-out)_120ms_both] px-5 pb-6 lg:pointer-events-none lg:absolute lg:inset-0 lg:grid lg:grid-cols-2 lg:gap-8 lg:p-10">
                    <div className="flex flex-col justify-between">
                      <p className="font-display hidden text-[44px] leading-[0.95] lg:block">{s.name}</p>
                      <p className="max-w-[36ch] text-[17px] leading-relaxed lg:text-[18px]">{s.text}</p>
                    </div>
                    <figure className="duotone relative hidden overflow-hidden lg:block">
                      <Image src={s.img.src} alt="" fill sizes="28vw" className="animate-[hero-zoom_6s_var(--ease-out)_both] object-cover" />
                    </figure>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
