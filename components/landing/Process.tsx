"use client";

import { useState } from "react";

const STAGES = [
  {
    name: "Nos cuentas tu caso",
    text: "Por WhatsApp, por el formulario o desde tu panel. Solo necesitamos una descripción breve y tus datos de contacto.",
    bg: "var(--carbon)",
    ink: "var(--white)",
  },
  {
    name: "Revisamos y te orientamos",
    text: "Un abogado del área revisa la información y te indica, con franqueza, si el asunto tiene camino jurídico y cuál.",
    bg: "var(--graphite)",
    ink: "var(--white)",
  },
  {
    name: "Propuesta por escrito",
    text: "Si decides avanzar, recibes una propuesta con el alcance del servicio y los honorarios. Nada empieza sin tu aprobación.",
    bg: "var(--navy)",
    ink: "var(--white)",
  },
  {
    name: "Estrategia y actuación",
    text: "Definimos la estrategia, preparamos los documentos y actuamos ante la autoridad que corresponda.",
    bg: "var(--steel)",
    ink: "var(--white)",
  },
  {
    name: "Seguimiento",
    text: "Consultas el estado y el historial de tu solicitud en tu panel cuando quieras.",
    bg: "var(--mist)",
    ink: "var(--navy)",
  },
];

/** Acordeón horizontal de paneles: de oscuro a claro, el orden lo da el tono. */
export function Process() {
  const [open, setOpen] = useState(0);

  return (
    <section aria-labelledby="proceso-title" className="bg-carbon py-[var(--section-gap)]">
      <div className="frame grid gap-6 lg:grid-cols-12">
        <h2 id="proceso-title" data-reveal className="font-display text-[clamp(40px,4.6vw,72px)] lg:col-span-5">
          Cómo te atendemos
        </h2>
        <p data-reveal className="max-w-[46ch] text-[18px] text-ink-soft lg:col-span-5 lg:col-start-7 lg:self-end">
          Cinco momentos, siempre en el mismo orden. Seleccionar una solicitud o un abogado no crea por sí solo una
          relación abogado-cliente: esa relación empieza cuando apruebas la propuesta.
        </p>
      </div>

      <ol data-reveal className="frame mt-16 flex flex-col lg:h-[520px] lg:flex-row">
        {STAGES.map((s, i) => {
          const isOpen = open === i;
          return (
            <li
              key={s.name}
              style={{ backgroundColor: s.bg, color: s.ink, flexBasis: isOpen ? "58%" : "10.5%" }}
              className="relative overflow-hidden transition-[flex-basis] duration-[650ms] ease-[var(--ease-out)] lg:min-w-0"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(i)}
                onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(i)}
                className="flex h-16 w-full items-center px-5 text-left text-[18px] font-semibold lg:absolute lg:inset-0 lg:h-full lg:items-end lg:px-6 lg:pb-6"
              >
                <span
                  className={`whitespace-nowrap transition-opacity duration-300 lg:origin-bottom-left lg:-rotate-90 lg:translate-x-[1.1em] ${
                    isOpen ? "lg:opacity-0" : "lg:opacity-100"
                  }`}
                >
                  {s.name}
                </span>
              </button>
              {isOpen ? (
                <div className="animate-[fade-up_500ms_var(--ease-out)_both] px-5 pb-6 lg:pointer-events-none lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-between lg:p-10">
                  <p className="font-display hidden text-[40px] leading-none lg:block">{s.name}</p>
                  <p className="max-w-[36ch] text-[17px] leading-relaxed lg:text-[18px]">{s.text}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
