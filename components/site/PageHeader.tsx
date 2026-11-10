import Image from "next/image";
import { SplitHeading } from "@/components/motion/SplitHeading";
import type { SiteImage } from "@/lib/content/generated-images";

/**
 * Tamaño del título según su largo: así ningún título pasa de dos líneas,
 * ni en un teléfono de 390px ni en una pantalla ancha.
 */
export function headlineSize(title: string) {
  const n = title.length;
  if (n <= 14) return "text-[clamp(56px,8.4vw,136px)]";
  if (n <= 26) return "text-[clamp(42px,6vw,100px)]";
  return "text-[clamp(32px,4.5vw,76px)]";
}

type Tone = "carbon" | "navy";

/**
 * Cabecera de páginas internas.
 * Con foto: el texto ocupa siete columnas y la foto llena el resto hasta el borde derecho, de arriba abajo;
 * en el teléfono la foto baja y corre de borde a borde bajo el texto.
 * Sin foto: un campo de color entero, con un bloque opcional a la derecha (`aside`).
 */
export function PageHeader({
  title,
  lead,
  image,
  imageAlt,
  caption,
  tone = "carbon",
  aside,
  children,
}: {
  title: string;
  lead?: string;
  image?: SiteImage;
  imageAlt?: string;
  caption?: string;
  tone?: Tone;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const bg = tone === "navy" ? "bg-navy" : "bg-carbon";
  const text = (
    <>
      <SplitHeading as="h1" trigger="load" className={`font-display ${headlineSize(title)}`}>
        {title}
      </SplitHeading>
      {lead ? (
        <p data-reveal className="mt-8 max-w-[54ch] text-[clamp(17px,1.3vw,20px)] leading-[1.55] text-ink">
          {lead}
        </p>
      ) : null}
      {children ? (
        <div data-reveal className="mt-10 flex flex-wrap gap-3">
          {children}
        </div>
      ) : null}
    </>
  );

  if (image) {
    return (
      <header className={`${bg} lg:grid lg:min-h-[min(92svh,900px)] lg:grid-cols-12`}>
        <div className="frame flex flex-col justify-end pb-12 pt-32 lg:col-span-7 lg:pb-24 lg:pr-12 lg:pt-44">{text}</div>
        <figure className="relative lg:col-span-5 lg:col-start-8">
          <div className="duotone relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
            <Image
              src={image.src}
              alt={imageAlt ?? image.title}
              fill
              priority
              sizes="(min-width:1024px) 42vw, 100vw"
              className="animate-[hero-zoom_1.6s_var(--ease-out)_both] object-cover"
            />
          </div>
          <figcaption className="frame relative z-[1] bg-carbon py-3 text-[14px] text-ink lg:absolute lg:bottom-0 lg:left-0 lg:max-w-[80%] lg:px-5">
            {caption ?? image.title}
          </figcaption>
        </figure>
      </header>
    );
  }

  return (
    <header className={bg}>
      <div className="frame grid gap-12 pb-16 pt-36 lg:grid-cols-12 lg:pb-24 lg:pt-48">
        <div className={aside ? "lg:col-span-8" : "lg:col-span-10"}>{text}</div>
        {aside ? (
          <div data-reveal className="lg:col-span-3 lg:col-start-10 lg:self-end">
            {aside}
          </div>
        ) : null}
      </div>
    </header>
  );
}
