"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { reducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

type Area = "Tránsito" | "Penal" | "Financiero" | "Digital" | "Migratorio" | "Buen nombre" | "Entidades";

interface Right {
  area: Area;
  situation: string;
  answer: string;
  basis: string;
  href: string;
}

const TRANSITO = "/especialidades/derecho-de-transito";
const PENAL = "/especialidades/derecho-penal";
const FINANCIERO = "/especialidades/derecho-economico-y-financiero";
const BUEN_NOMBRE = "/especialidades/proteccion-del-buen-nombre";
const DIGITAL = "/especialidades/derecho-digital-y-tecnologico";
const MIGRATORIO = "/especialidades/derecho-migratorio-y-visas";
const CONTACTO = "/contacto";

const RIGHTS: Right[] = [
  // Tránsito
  {
    area: "Tránsito",
    situation: "Te impusieron un comparendo",
    answer:
      "Si lo aceptas y haces el curso, pagar en los 5 días hábiles siguientes reduce la multa a la mitad; hasta el día 20, un 25 %. Si no estás de acuerdo, no pagues: pide audiencia de impugnación dentro del plazo.",
    basis: "Ley 769 de 2002, art. 136",
    href: TRANSITO,
  },
  {
    area: "Tránsito",
    situation: "Te llegó una fotomulta",
    answer:
      "Debe notificarse dentro de los 3 días hábiles siguientes a su validación, y debe identificar al conductor. Los plazos para impugnar corren desde la notificación, no desde la foto.",
    basis: "Ley 1843 de 2017, art. 8",
    href: TRANSITO,
  },
  {
    area: "Tránsito",
    situation: "Te piden la prueba de alcoholemia",
    answer:
      "Puedes negarte, pero la ley sanciona la negativa como el grado más alto de embriaguez: multa, suspensión de la licencia e inmovilización del vehículo. Pide que todo el procedimiento quede por escrito.",
    basis: "Ley 1696 de 2013",
    href: TRANSITO,
  },
  {
    area: "Tránsito",
    situation: "Te cobran una multa de hace años",
    answer:
      "El cobro de una multa de tránsito prescribe a los 3 años de ocurridos los hechos; solo el mandamiento de pago interrumpe ese plazo. Si no te lo notificaron a tiempo, puedes pedir que la declaren prescrita.",
    basis: "Ley 769 de 2002, art. 159",
    href: TRANSITO,
  },

  // Penal
  {
    area: "Penal",
    situation: "Te capturan o te citan a declarar",
    answer:
      "Puedes guardar silencio, no declarar contra ti ni contra tu familia cercana y contar con un abogado desde el primer momento. Nada de lo que digas sin defensa debería usarse en tu contra.",
    basis: "Constitución Política, arts. 29 y 33",
    href: PENAL,
  },
  {
    area: "Penal",
    situation: "Te detuvieron sin orden de un juez",
    answer:
      "Salvo flagrancia, una captura exige orden escrita de autoridad judicial. En cualquier caso, deben ponerte a disposición de un juez dentro de las 36 horas siguientes para que revise su legalidad.",
    basis: "Constitución Política, art. 28",
    href: PENAL,
  },
  {
    area: "Penal",
    situation: "Fuiste víctima de un delito",
    answer:
      "Tienes derecho a denunciar, a recibir información sobre el avance del caso, a ser escuchado, a contar con un abogado que te represente y a una reparación integral del daño.",
    basis: "Ley 906 de 2004, art. 11",
    href: PENAL,
  },
  {
    area: "Penal",
    situation: "Te proponen aceptar cargos",
    answer:
      "Un preacuerdo o la aceptación de cargos puede rebajar la pena, pero renuncias a un juicio. Decídelo solo con tu abogado y después de conocer las pruebas que tiene la Fiscalía.",
    basis: "Ley 906 de 2004, arts. 348 y siguientes",
    href: PENAL,
  },

  // Financiero
  {
    area: "Financiero",
    situation: "Te cobran una deuda a toda hora",
    answer:
      "La ley limita los horarios y la frecuencia de las gestiones de cobro y prohíbe contactar a tus familiares, vecinos o compañeros de trabajo para presionarte.",
    basis: "Ley 2300 de 2023",
    href: FINANCIERO,
  },
  {
    area: "Financiero",
    situation: "Te cobran un seguro que no pediste",
    answer:
      "Como consumidor financiero tienes derecho a información clara y a que no te impongan productos que no pediste. Reclama ante la entidad, su defensor del consumidor financiero o la Superintendencia Financiera.",
    basis: "Ley 1328 de 2009",
    href: FINANCIERO,
  },
  {
    area: "Financiero",
    situation: "Quieres pagar tu crédito antes",
    answer:
      "En créditos de hasta 880 salarios mínimos puedes abonar o pagar el total antes del plazo sin penalidad. Pide por escrito que el abono vaya a capital y si prefieres bajar la cuota o el plazo.",
    basis: "Ley 1555 de 2012",
    href: FINANCIERO,
  },
  {
    area: "Financiero",
    situation: "Compraste un producto defectuoso",
    answer:
      "Todo producto tiene garantía legal: deben repararlo gratis y, si la falla se repite, cambiarlo o devolverte el dinero. Si el vendedor no responde, acude a la Superintendencia de Industria y Comercio.",
    basis: "Ley 1480 de 2011, arts. 7 y 11",
    href: FINANCIERO,
  },

  // Buen nombre
  {
    area: "Buen nombre",
    situation: "Apareces reportado en una central de riesgo",
    answer:
      "Antes de un reporte negativo deben avisarte con al menos 20 días calendario. Puedes pedir que lo actualicen o rectifiquen, y la entidad debe responderte.",
    basis: "Ley 1266 de 2008, art. 12",
    href: BUEN_NOMBRE,
  },
  {
    area: "Buen nombre",
    situation: "Ya pagaste y sigues reportado",
    answer:
      "Después del pago, el dato negativo permanece el doble del tiempo que duró la mora, sin pasar de 4 años. Cumplido ese plazo debe desaparecer; si sigue ahí, presenta un reclamo.",
    basis: "Ley 1266 de 2008, art. 13 (modificado por la Ley 2157 de 2021)",
    href: BUEN_NOMBRE,
  },
  {
    area: "Buen nombre",
    situation: "Tu historial de crédito tiene errores",
    answer:
      "Puedes consultar tu información en las centrales de riesgo y reclamar si hay datos equivocados. Deben responder las consultas en 10 días hábiles y los reclamos en 15.",
    basis: "Ley 1266 de 2008, art. 16",
    href: BUEN_NOMBRE,
  },
  {
    area: "Buen nombre",
    situation: "Publicaron mentiras sobre ti en redes",
    answer:
      "Puedes pedir a quien publicó que rectifique o retire la información falsa. Si no lo hace y el daño a tu buen nombre continúa, un juez puede ordenarlo mediante una acción de tutela.",
    basis: "Constitución Política, arts. 15, 20 y 86",
    href: BUEN_NOMBRE,
  },

  // Digital
  {
    area: "Digital",
    situation: "Publicaron tus datos o fotos sin permiso",
    answer:
      "Puedes exigir la supresión al responsable de los datos. Si no atiende tu solicitud, presentas una queja ante la Superintendencia de Industria y Comercio.",
    basis: "Ley 1581 de 2012",
    href: DIGITAL,
  },
  {
    area: "Digital",
    situation: "Entraron a tu cuenta sin permiso",
    answer:
      "Acceder sin autorización a un sistema o usar tus datos personales sin permiso son delitos. Guarda capturas, correos y enlaces, cambia tus claves y denuncia ante la Fiscalía cuanto antes.",
    basis: "Ley 1273 de 2009 (Código Penal, arts. 269A y 269F)",
    href: DIGITAL,
  },
  {
    area: "Digital",
    situation: "Te sacaron dinero por internet",
    answer:
      "Avisa de inmediato a tu banco para bloquear tus productos y presenta el reclamo por escrito. El fraude por medios informáticos es delito: denúncialo y conserva toda la evidencia.",
    basis: "Ley 1273 de 2009",
    href: DIGITAL,
  },
  {
    area: "Digital",
    situation: "Compraste en línea y te arrepentiste",
    answer:
      "En compras por internet o por teléfono tienes 5 días hábiles desde la entrega para retractarte y recibir tu dinero de vuelta. Hay excepciones, como bienes personalizados o perecederos.",
    basis: "Ley 1480 de 2011, art. 47",
    href: DIGITAL,
  },

  // Migratorio
  {
    area: "Migratorio",
    situation: "Tu visa o permiso está por vencer",
    answer:
      "Tramita la renovación o el cambio de categoría antes del vencimiento. Permanecer de forma irregular genera multas y puede terminar en una salida obligatoria del país.",
    basis: "Decreto 1067 de 2015",
    href: MIGRATORIO,
  },
  {
    area: "Migratorio",
    situation: "Migración abrió un proceso en tu contra",
    answer:
      "Como extranjero tienes los mismos derechos civiles que un colombiano, incluido el debido proceso: conocer la actuación, presentar descargos y pruebas, e interponer recursos antes de que la decisión quede en firme.",
    basis: "Constitución Política, arts. 29 y 100",
    href: MIGRATORIO,
  },
  {
    area: "Migratorio",
    situation: "Tu pareja es colombiana",
    answer:
      "El matrimonio o la unión marital con una persona colombiana permite pedir una visa de migrante. Reúne desde el principio las pruebas de la relación y de la convivencia: son lo primero que revisan.",
    basis: "Decreto 1067 de 2015",
    href: MIGRATORIO,
  },
  {
    area: "Migratorio",
    situation: "Tu hijo nació en Colombia",
    answer:
      "Si el padre o la madre es colombiano, o alguno estaba domiciliado en Colombia al momento del nacimiento, el niño es colombiano por nacimiento. Al registrarlo deberás acreditar ese domicilio.",
    basis: "Constitución Política, art. 96",
    href: MIGRATORIO,
  },

  // Entidades
  {
    area: "Entidades",
    situation: "Una entidad no responde tu petición",
    answer:
      "Como regla general deben contestarte de fondo en 15 días hábiles. Si no lo hacen, la acción de tutela protege tu derecho de petición.",
    basis: "Constitución Política, art. 23; Ley 1755 de 2015, art. 14",
    href: CONTACTO,
  },
  {
    area: "Entidades",
    situation: "Pediste copias o información pública",
    answer:
      "Las solicitudes de documentos e información deben resolverse en 10 días hábiles, y las consultas sobre temas a cargo de la entidad, en 30. Guarda el radicado: es tu prueba del plazo.",
    basis: "Ley 1755 de 2015, art. 14",
    href: CONTACTO,
  },
  {
    area: "Entidades",
    situation: "Vulneran un derecho fundamental tuyo",
    answer:
      "Puedes presentar una tutela sin abogado y el juez debe decidirla en máximo 10 días. Procede cuando no tienes otro medio eficaz de defensa o para evitar un perjuicio irremediable.",
    basis: "Constitución Política, art. 86; Decreto 2591 de 1991",
    href: CONTACTO,
  },
  {
    area: "Entidades",
    situation: "Tu EPS te niega un tratamiento",
    answer:
      "La salud es un derecho fundamental. Si tu EPS niega o demora un servicio que ordenó tu médico, pide la negativa por escrito y presenta una petición; si no la resuelven, procede la tutela.",
    basis: "Ley 1751 de 2015, art. 2; Constitución Política, art. 86",
    href: CONTACTO,
  },
];

const AREAS: ("Todas" | Area)[] = ["Todas", "Tránsito", "Penal", "Financiero", "Buen nombre", "Digital", "Migratorio", "Entidades"];

/** Cuántos derechos se ven en "Todas" antes de expandir. */
const PREVIEW = 8;

/** Orden para "Todas": uno de cada área por vuelta, así el resumen inicial cubre todas las áreas. */
const MIXED: Right[] = (() => {
  const byArea = AREAS.slice(1).map((a) => RIGHTS.filter((r) => r.area === a));
  const rounds = Math.max(...byArea.map((g) => g.length));
  const out: Right[] = [];
  for (let i = 0; i < rounds; i++) byArea.forEach((g) => g[i] && out.push(g[i]));
  return out;
})();

/**
 * Derechos que conviene conocer: situaciones cotidianas con la respuesta corta y su norma.
 * "Todas" muestra un resumen y un botón para ver el resto; cada área muestra todos los suyos.
 */
export function Rights() {
  const [area, setArea] = useState<(typeof AREAS)[number]>("Todas");
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  // Desde qué tarjeta animar tras una interacción (null: carga inicial, sin animación).
  const animateFrom = useRef<number | null>(null);

  const pool = area === "Todas" ? MIXED : RIGHTS.filter((r) => r.area === area);
  const collapsed = area === "Todas" && !expanded;
  const list = collapsed ? pool.slice(0, PREVIEW) : pool;

  // Las tarjetas nuevas entran escalonadas y se recalculan las posiciones de las animaciones de abajo.
  useEffect(() => {
    const el = listRef.current;
    const from = animateFrom.current;
    if (!el || from === null) return;
    animateFrom.current = null;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    const items = Array.from(el.children).slice(from);
    if (reducedMotion() || !items.length) return () => cancelAnimationFrame(frame);
    const tween = gsap.fromTo(
      items,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "expo.out", stagger: { amount: 0.3 }, overwrite: true, clearProps: "transform,opacity" },
    );
    return () => {
      cancelAnimationFrame(frame);
      tween.kill();
    };
  }, [area, expanded]);

  const pick = (a: (typeof AREAS)[number]) => {
    if (a === area) return;
    animateFrom.current = 0;
    setArea(a);
  };

  const toggleAll = () => {
    const next = !expanded;
    animateFrom.current = next ? PREVIEW : Number.POSITIVE_INFINITY;
    setExpanded(next);
    // Al expandir, el foco pasa a la primera tarjeta nueva (ya está junto al botón: sin saltos).
    if (next) requestAnimationFrame(() => listRef.current?.querySelectorAll("a")[PREVIEW]?.focus({ preventScroll: true }));
  };

  return (
    <section aria-labelledby="derechos-title" className="bg-navy py-[var(--section-gap)]">
      <div className="frame grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-[112px]">
            <SplitHeading id="derechos-title" className="font-display text-[clamp(40px,4.6vw,72px)]">
              Derechos que conviene conocer
            </SplitHeading>
            <p data-reveal className="mt-6 max-w-[42ch] text-[17px] text-ink">
              Lo que la ley ya te reconoce en las situaciones que más nos consultan. Información general: cada caso
              tiene matices y una asesoría los revisa.
            </p>
            <figure data-media className="duotone relative mt-10 hidden aspect-[4/3] lg:block">
              <Image src="/img/expediente.jpg" alt="Expedientes atados con cuerda sobre un escritorio oscuro" fill sizes="38vw" quality={70} className="object-cover" />
            </figure>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-6 lg:col-start-7">
          <div data-reveal role="group" aria-label="Filtrar por área" className="-mx-[var(--margin)] flex gap-2 overflow-x-auto px-[var(--margin)] pb-2 lg:mx-0 lg:flex-wrap lg:px-0">
            {AREAS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={area === a}
                aria-controls="derechos-lista"
                onClick={() => pick(a)}
                className={`btn shrink-0 !min-h-[40px] !px-4 text-[15px] ${area === a ? "btn-primary" : "bg-carbon text-ink hover:bg-graphite"}`}
              >
                {a}
              </button>
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            {`Mostrando ${list.length} de ${pool.length} derechos${area === "Todas" ? "" : ` de ${area}`}.`}
          </p>

          <ul id="derechos-lista" ref={listRef} data-reveal className="mt-10 space-y-3">
            {list.map((r) => (
              <li key={r.situation}>
                <Link
                  href={r.href}
                  className="group relative block bg-carbon p-6 transition-[background-color,scale] duration-200 ease-[var(--ease-out)] hover:bg-graphite focus-visible:bg-graphite active:scale-[0.99] md:p-8"
                >
                  {/* Línea que se traza al pasar el cursor o al enfocar */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-mist transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                  <p className="text-[15px] text-ink-soft">{r.area}</p>
                  <p className="font-display mt-2 text-[clamp(26px,2.4vw,36px)] leading-[1.05]">{r.situation}</p>
                  <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-ink">{r.answer}</p>
                  <p className="mt-4 flex items-center justify-between gap-4 text-[15px] text-mist">
                    <span>{r.basis}</span>
                    <span aria-hidden className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1 group-focus-visible:translate-x-1">
                      →
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {area === "Todas" && pool.length > PREVIEW ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="derechos-lista"
              onClick={toggleAll}
              className="btn mt-6 w-full bg-carbon text-ink hover:bg-graphite sm:w-auto"
            >
              {expanded ? "Ver menos derechos" : `Ver todos los derechos (${pool.length})`}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
