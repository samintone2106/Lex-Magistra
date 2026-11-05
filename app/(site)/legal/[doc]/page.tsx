import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import { legalDocs } from "@/lib/content/legal";
import { DEFAULT_SETTINGS } from "@/lib/content/settings";

type Params = { doc: string };

export function generateStaticParams(): Params[] {
  return Object.keys(legalDocs(DEFAULT_SETTINGS)).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { doc } = await params;
  const d = legalDocs(await getSettings())[doc];
  return d ? { title: d.title, description: d.description, alternates: { canonical: `/legal/${doc}` } } : {};
}

export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { doc } = await params;
  const docs = legalDocs(await getSettings());
  const d = docs[doc];
  if (!d) notFound();

  return (
    <article className="bg-carbon pb-[var(--section-gap)] pt-36 lg:pt-44">
      <div className="frame grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-8">
          <h1 className="font-display text-[clamp(40px,5vw,80px)]">{d.title}</h1>
          <p className="mt-6 max-w-[56ch] text-[18px] text-ink-soft">{d.description}</p>
        </header>
        <nav aria-label="Documentos legales" className="lg:col-span-3 lg:col-start-1 lg:row-start-2">
          <ul className="space-y-2 text-[16px] lg:sticky lg:top-28">
            {Object.entries(docs).map(([slug, x]) => (
              <li key={slug}>
                <Link href={`/legal/${slug}`} aria-current={slug === doc ? "page" : undefined} className={slug === doc ? "text-ink" : "text-ink-soft hover:text-ink"}>
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-[68ch] space-y-10 lg:col-span-7 lg:col-start-5 lg:row-start-2">
          {d.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[20px] font-semibold">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 text-[17px] leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
