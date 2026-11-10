import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { LoopVideo } from "@/components/motion/LoopVideo";

const CHECKLIST = [
  {
    area: "Tránsito",
    items: ["Número del comparendo o la fotomulta", "Placa del vehículo y tu licencia", "Notificación recibida y su fecha"],
  },
  {
    area: "Penal",
    items: ["Citación, orden o denuncia que tengas", "Fechas y nombres de las personas involucradas", "No publiques nada del caso en redes"],
  },
  {
    area: "Económico y financiero",
    items: ["Contratos, pagarés o pólizas", "Extractos y comprobantes de pago", "Mensajes o cartas de la entidad"],
  },
  {
    area: "Digital y tecnológico",
    items: ["Capturas de pantalla con fecha visible", "Enlaces y perfiles involucrados", "Correos o chats relacionados"],
  },
  {
    area: "Migratorio y visas",
    items: ["Pasaporte y visa o permiso vigente", "Fechas de entrada y salida del país", "Cartas de empleador o de estudio, si aplican"],
  },
  {
    area: "Buen nombre",
    items: ["La publicación o el reporte", "Quién lo hizo y cuándo", "Respuestas que hayas recibido"],
  },
];

/** Cómo llegar preparado: qué traer según el área, y dónde y cuándo atendemos. */
export function FirstConsult({ settings }: { settings: SiteSettings }) {
  return (
    <section aria-labelledby="consulta-title" className="bg-graphite py-[var(--section-gap)]">
      <div className="frame grid gap-6 lg:grid-cols-12">
        <SplitHeading id="consulta-title" className="font-display text-[clamp(40px,4.6vw,72px)] lg:col-span-7">
          Llega preparado a tu consulta
        </SplitHeading>
        <p data-reveal className="max-w-[44ch] text-[17px] text-ink lg:col-span-4 lg:col-start-9 lg:self-end">
          Con estos documentos a la mano, la primera conversación rinde el doble. Si te falta alguno, igual escríbenos:
          te decimos cómo conseguirlo.
        </p>
      </div>

      <div className="frame mt-16 grid gap-10 lg:grid-cols-12 lg:gap-6">
        <figure data-media className="duotone relative aspect-[3/2] self-start lg:col-span-5">
          <LoopVideo
            mp4="/video/web-exp.mp4"
            webm="/video/web-exp.webm"
            poster="/video/web-exp.jpg"
            label="Expedientes atados sobre un escritorio, con la luz de la mañana"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </figure>

        <dl className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {CHECKLIST.map((c) => (
            <div key={c.area} data-reveal>
              <dt className="font-display text-[clamp(26px,2.2vw,34px)] leading-none">{c.area}</dt>
              <dd className="mt-4">
                <ul className="space-y-2 text-[16px] leading-snug text-ink">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <span aria-hidden className="mt-[0.55em] h-[6px] w-[6px] shrink-0 bg-mist" />
                      {it}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="frame mt-20 grid gap-6 bg-carbon py-10 md:grid-cols-3 md:items-end" data-reveal>
        <div>
          <p className="font-display text-[clamp(30px,3vw,44px)] leading-none">Todo el país</p>
          <p className="mt-2 text-[16px] text-ink-soft">Atención virtual en los 32 departamentos.</p>
        </div>
        <div>
          <p className="font-display text-[clamp(30px,3vw,44px)] leading-none">{settings.city || "Presencial"}</p>
          <p className="mt-2 text-[16px] text-ink-soft">
            {settings.address ? `${settings.address}. ` : ""}Presencial cuando el caso lo pide.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <p className="text-[16px] text-ink-soft">{settings.hours}</p>
          <Link href="/panel/nueva-solicitud" className="btn btn-primary">
            Agendar mi consulta
          </Link>
        </div>
      </div>
    </section>
  );
}
