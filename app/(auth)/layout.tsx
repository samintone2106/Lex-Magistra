import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileLock2, Handshake, ShieldCheck } from "lucide-react";
import { Monogram } from "@/components/site/Monogram";
import { getSettings } from "@/lib/data";

const PROMISES = [
  {
    Icon: FileLock2,
    title: "Confidencialidad",
    body: "Lo que nos cuentes está protegido por el secreto profesional del abogado y solo lo lee el equipo que atiende tu caso.",
  },
  {
    Icon: ShieldCheck,
    title: "Tus datos, según la Ley 1581 de 2012",
    body: "Los usamos solo para atender tus solicitudes. Puedes conocerlos, corregirlos o pedir que los eliminemos.",
  },
  {
    Icon: Handshake,
    title: "Sin compromiso",
    body: "Crear una cuenta o enviar una solicitud no te obliga a contratar. La relación empieza solo si apruebas una propuesta.",
  },
];

function Promises({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`grid ${compact ? "gap-5" : "gap-6 xl:grid-cols-3 xl:gap-8"}`}>
      {PROMISES.map(({ Icon, title, body }) => (
        <li key={title} className="grid grid-cols-[18px_1fr] gap-x-3">
          <Icon aria-hidden size={18} strokeWidth={1.6} className="mt-[3px] text-mist" />
          <div>
            <p className="text-[15px] font-medium">{title}</p>
            <p className="mt-1 text-[14px] leading-snug text-ink-soft">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <div className="grid min-h-[100svh] bg-carbon lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Columna de la fotografía: La Candelaria después de la lluvia, con el duotono de la firma */}
      <aside aria-label="Por qué confiar en nosotros" className="hidden flex-col lg:sticky lg:top-0 lg:flex lg:h-[100svh]">
        <div className="duotone relative min-h-0 flex-1">
          <Image src="/img/candelaria-lluvia.jpg" alt="" fill priority sizes="45vw" className="object-cover object-[50%_60%]" />
        </div>
        <div className="bg-graphite px-10 py-9">
          <p className="font-display mb-6 max-w-[22ch] text-[30px] leading-[1.05]">Tu caso, en buenas manos.</p>
          <Promises />
        </div>
      </aside>

      <main id="contenido" className="flex min-h-[100svh] flex-col px-4 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label={`${s.firm_name}, inicio`}>
            <Monogram className="h-8 w-8 text-mist" />
            <span className="text-[15px] font-semibold">{s.firm_name}</span>
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-ink-soft hover:text-ink">
            <ArrowLeft aria-hidden size={15} /> Volver al sitio
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-12 transition-[opacity,transform] duration-[260ms] ease-[var(--ease-out)] starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none">
          {children}
        </div>
        <div className="mx-auto w-full max-w-[460px] border-t border-white/[0.07] pt-8 lg:hidden">
          <Promises compact />
        </div>
      </main>
    </div>
  );
}
