import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSession, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { StatusBadge } from "@/components/panel/StatusBadge";
import type { ConsultationRequest } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function PanelHome({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const { clave } = await searchParams;
  const [session, specialties] = await Promise.all([getSession(), getSpecialties()]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("consultation_requests")
    .select("id,subject,status,specialty_id,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const requests = (data ?? []) as Pick<ConsultationRequest, "id" | "subject" | "status" | "specialty_id" | "created_at" | "updated_at">[];
  const open = requests.filter((r) => r.status === "pendiente" || r.status === "en_revision").length;
  const firstName = session?.profile.full_name.split(" ")[0] || "";
  const specName = (id: string) => specialties.find((s) => s.id === id)?.short_name ?? "—";
  const incomplete = !session?.profile.phone || !session?.profile.document_id;

  return (
    <>
      <PanelTitle title={`Hola${firstName ? `, ${firstName}` : ""}`} lead="Desde aquí gestionas tus consultas jurídicas.">
        <Link href="/panel/nueva-solicitud" className="btn btn-primary">
          Nueva solicitud
        </Link>
      </PanelTitle>

      {clave ? <p role="status" className="mb-6 bg-navy p-4 text-[15px]">Tu contraseña fue actualizada.</p> : null}
      {incomplete ? (
        <p className="mb-6 bg-graphite p-4 text-[15px]">
          Completa tu teléfono y documento para que el equipo pueda contactarte.{" "}
          <Link href="/panel/perfil" className="link">Ir a mi perfil</Link>
        </p>
      ) : null}

      <dl className="mb-12 grid gap-4 sm:grid-cols-3">
        <div className="bg-graphite p-5">
          <dt className="text-[14px] text-ink-soft">Solicitudes abiertas</dt>
          <dd className="font-display mt-2 text-[44px] leading-none">{open}</dd>
        </div>
        <div className="bg-graphite p-5">
          <dt className="text-[14px] text-ink-soft">Total recientes</dt>
          <dd className="font-display mt-2 text-[44px] leading-none">{requests.length}</dd>
        </div>
        <div className="bg-navy p-5">
          <dt className="text-[14px] text-ink-soft">¿No sabes qué área necesitas?</dt>
          <dd className="mt-2 text-[15px]">
            <Link href="/especialidades" className="link">Ver especialidades</Link>
          </dd>
        </div>
      </dl>

      <h2 className="mb-4 text-[20px] font-semibold">Últimas solicitudes</h2>
      {requests.length ? (
        <ul className="divide-y divide-carbon bg-graphite">
          {requests.map((r) => (
            <li key={r.id}>
              <Link href={`/panel/solicitudes/${r.id}`} className="flex flex-col gap-2 p-4 transition-colors hover:bg-navy sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block text-[16px] font-medium">{r.subject}</span>
                  <span className="text-[14px] text-ink-soft">
                    {specName(r.specialty_id)} · {fmt.format(new Date(r.created_at))}
                  </span>
                </span>
                <StatusBadge status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-graphite p-8">
          <p className="text-[17px]">Aún no has enviado solicitudes.</p>
          <p className="mt-1 text-[15px] text-ink-soft">Elige una especialidad, un abogado y cuéntanos tu caso en cuatro pasos.</p>
          <Link href="/panel/nueva-solicitud" className="btn btn-primary mt-5">
            Empezar
          </Link>
        </div>
      )}
    </>
  );
}
