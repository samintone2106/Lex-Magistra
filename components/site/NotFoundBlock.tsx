import Link from "next/link";

/** Página no encontrada dentro del sitio (conserva el menú y el pie). */
export function NotFoundBlock({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <section aria-labelledby="nf-title" className="bg-carbon pb-[var(--section-gap)] pt-36 lg:pt-44">
      <div className="frame">
        <h1 id="nf-title" className="font-display text-[clamp(42px,6vw,96px)] lg:max-w-[16ch]">
          {title}
        </h1>
        <p className="mt-8 max-w-[52ch] text-[18px]">{text}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={href} className="btn btn-primary">
            {cta}
          </Link>
          <Link href="/contacto" className="btn btn-secondary">
            Contactar
          </Link>
        </div>
      </div>
    </section>
  );
}
