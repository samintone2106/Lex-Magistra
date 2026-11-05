import Link from "next/link";

export default function NotFound() {
  return (
    <main className="frame grid min-h-[100svh] place-content-center gap-6 bg-carbon text-center">
      <h1 className="font-display text-[clamp(48px,8vw,120px)]">Página no encontrada</h1>
      <p className="text-[18px] text-ink-soft">La dirección no existe o fue movida.</p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="btn btn-primary">Volver al inicio</Link>
        <Link href="/especialidades" className="btn btn-secondary">Ver especialidades</Link>
      </div>
    </main>
  );
}
