import { Monogram } from "@/components/site/Monogram";

/** Cortina de entrada: el monograma se dibuja y la cortina sube. Solo CSS, se retira sola aunque falle JS. */
export function Preloader({ firmName }: { firmName: string }) {
  return (
    <div className="preloader" aria-hidden>
      <div className="flex flex-col items-center gap-5 text-mist">
        <Monogram className="h-24 w-24" />
        <p className="name font-display text-[32px] text-ink">{firmName}</p>
      </div>
    </div>
  );
}
