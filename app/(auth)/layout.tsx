import Image from "next/image";
import Link from "next/link";
import { Monogram } from "@/components/site/Monogram";
import { getSettings } from "@/lib/data";
import { IMAGES } from "@/lib/content/credits";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <div className="grid min-h-[100svh] bg-carbon lg:grid-cols-2">
      <aside className="duotone relative hidden lg:block">
        <Image src={IMAGES.palacio.src} alt="" fill priority sizes="50vw" className="object-cover" />
        <p className="font-display absolute bottom-10 left-10 z-10 max-w-[14ch] text-[clamp(44px,4.4vw,72px)] leading-[0.95] text-ink">
          Tu caso, en buenas manos.
        </p>
      </aside>
      <main id="contenido" className="flex flex-col px-[var(--margin)] py-8">
        <Link href="/" className="flex items-center gap-3 self-start" aria-label={`${s.firm_name}, inicio`}>
          <Monogram className="h-8 w-8" />
          <span className="text-[15px] font-semibold">{s.firm_name}</span>
        </Link>
        <div className="page-enter mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12">{children}</div>
      </main>
    </div>
  );
}
