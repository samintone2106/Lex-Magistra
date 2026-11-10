import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import { legalDocs } from "@/lib/content/legal";
import { DEFAULT_SETTINGS } from "@/lib/content/settings";

export const revalidate = 300;

type Params = { doc: string };

export function generateStaticParams(): Params[] {
  return Object.keys(legalDocs(DEFAULT_SETTINGS)).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { doc } = await params;
  const d = legalDocs(await getSettings())[doc];
  return d ? { title: d.title, description: d.description, alternates: { canonical: `/legal/${doc}` } } : {};
}

const anchor = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { doc } = await params;
  const docs = legalDocs(await getSettings());
  const d = docs[doc];
  if (!d) notFound();

  return (
    <article>
      <header className="bg-navy">
        <div className="frame grid gap-8 pb-16 pt-36 lg:grid-cols-12 lg:pb-20 lg:pt-44">
          <h1 className="font-display text-[clamp(32px,4.6vw,76px)] lg:col-span-9">{d.title}</h1>
          <p className="max-w-[56ch] text-[18px] lg:col-span-7">{d.description}</p>
        </div>
      </header>

      <div className="bg-carbon py-[clamp(56px,7vw,112px)]">
        <div className="frame grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-10 lg:sticky lg:top-28">
              <nav aria-label="Documentos legales">
                <h2 className="text-[16px] font-semibold">Documentos</h2>
                <ul className="mt-3 flex flex-col gap-1">
                  {Object.entries(docs).map(([slug, x]) => (
                    <li key={slug}>
                      <Link
                        href={`/legal/${slug}`}
                        aria-current={slug === doc ? "page" : undefined}
                        className={`block px-4 py-3 text-[16px] leading-snug transition-colors duration-200 ${
                          slug === doc ? "bg-mist text-navy" : "bg-graphite text-ink hover:bg-navy"
                        }`}
                      >
                        {x.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="En este documento" className="hidden lg:block">
                <h2 className="text-[16px] font-semibold">En este documento</h2>
                <ul className="mt-3 space-y-2 text-[16px]">
                  {d.sections.map((s) => (
                    <li key={s.heading}>
                      <a href={`#${anchor(s.heading)}`} className="text-ink-soft transition-colors duration-200 hover:text-ink">
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          <div className="max-w-[68ch] space-y-12 lg:col-span-7 lg:col-start-5">
            {d.sections.map((s) => (
              <section key={s.heading} id={anchor(s.heading)} aria-labelledby={`${anchor(s.heading)}-h`} className="scroll-mt-28">
                <h2 id={`${anchor(s.heading)}-h`} className="font-display text-[clamp(26px,2.2vw,34px)] leading-[1.05]">
                  {s.heading}
                </h2>
                {s.body.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-4 text-[17px] leading-relaxed text-ink">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
