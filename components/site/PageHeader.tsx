import Image from "next/image";
import { SplitHeading } from "@/components/motion/SplitHeading";
import type { ImageCredit } from "@/lib/content/credits";

/** Cabecera de páginas internas: título grande que entra por palabras, entradilla y foto opcional. */
export function PageHeader({
  title,
  lead,
  image,
  imageAlt,
  children,
}: {
  title: string;
  lead?: string;
  image?: ImageCredit;
  imageAlt?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="bg-carbon pb-16 pt-36 lg:pb-24 lg:pt-44">
      <div className="frame grid gap-10 lg:grid-cols-12">
        <div className={image ? "lg:col-span-7" : "lg:col-span-10"}>
          <SplitHeading as="h1" trigger="load" className="font-display text-[clamp(48px,7vw,120px)]">
            {title}
          </SplitHeading>
          {lead ? (
            <p data-reveal className="mt-8 max-w-[52ch] text-[18px] text-ink-soft">
              {lead}
            </p>
          ) : null}
          {children ? (
            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              {children}
            </div>
          ) : null}
        </div>
        {image ? (
          <figure data-reveal className="duotone relative aspect-[4/5] lg:col-span-4 lg:col-start-9">
            <Image src={image.src} alt={imageAlt ?? image.title} fill priority sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
          </figure>
        ) : null}
      </div>
    </header>
  );
}
