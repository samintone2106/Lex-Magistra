import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLawyers, getSession, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { OPEN_STATUSES, STATUS_HELP, StatusBadge } from "@/components/panel/StatusBadge";
import { CaseTimeline, relativeDay } from "@/components/panel/CaseTimeline";
import { Panel, PanelLink } from "@/components/ui/Panel";
import { BlockError, EmptyState, Notice } from "@/components/ui/States";
import { STATUS_LABEL, type ConsultationRequest } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

type Row = Pick<ConsultationRequest, "id" | "subject" | "status" | "specialty_id" | "lawyer_id" | "created_at" | "updated_at">;

export default async function PanelHome({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const { clave } = await searchParams;
  const supabase = await createClient();
  const [session, specialties, lawyers, { data, error }] = await Promise.all([
    getSession(),
    getSpecialties(),
    getLawyers(),
    supabase
      .from("consultation_requests")
      .select("id,subject,status,specialty_id,lawyer_id,created_at,updated_at")
      .order("created_at", { ascending: false }),
  ]);
  const requests = (data ?? []) as Row[];
  const open = requests.filter((r) => OPEN_STATUSES.includes(r.status));
  const contacted = requests.filter((r) => r.status === "contactado").length;
  const closed = requests.filter((r) => r.status === "cerrado" || r.status === "rechazado").length;
  const lead = open[0] ?? requests[0];
  const profile = session?.profile;
  const firstName = profile?.full_name.split(" ")[0] || "";
  const specName = (id: string) => specialties.find((s) => s.id === id)?.name ?? "—";
  const lawyerName = (id: string | null) => lawyers.find((l) => l.id === id)?.full_name ?? "Asignación por la firma";

  const contactFields = [
    { label: "Nombre completo", done: !!profile?.full_name },
    { label: "Celular", done: !!profile?.phone },
    { label: "Documento de identidad", done: !!profile?.document_id },
    { label: "Ciudad", done: !!profile?.city },
  ];
  const filled = contactFields.filter((f) => f.done).length;

  const finding = !requests.length
    ? "Todavía no has enviado solicitudes. Empieza por elegir el área de tu asunto."
    : open.length
      ? `Tienes ${open.length} ${open.length === 1 ? "solicitud abierta" : "solicitudes abiertas"}. La más reciente está «${STATUS_LABEL[open[0].status].toLowerCase()}».`
      : "No tienes solicitudes abiertas en este momento.";

  return (
    <>
      <PanelTitle title={`Hola${firstName ? `, ${firstName}` : ""}`} lead={finding}>
        <Link href="/panel/nueva-solicitud" className="btn btn-primary">
          Nueva solicitud
        </Link>
      </PanelTitle>

      <div className="mb-6 grid gap-3 empty:hidden">
        {clave ? <Notice tone="success">Tu contraseña fue actualizada. La próxima vez ingresa con la nueva.</Notice> : null}
        {error ? <BlockError what="tus solicitudes" retryHref="/panel" /> : null}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {/* Lo primero: en qué va tu caso */}
        {lead ? (
          <Panel title={open.length ? "Tu caso en curso" : "Tu última solicitud"} id="caso" meta={`Enviada ${relativeDay(lead.created_at)}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/panel/solicitudes/${lead.id}`} className="text-[20px] font-semibold leading-snug hover:text-mist">
                  {lead.subject}
                </Link>
                <p className="mt-1 text-[14px] text-ink-soft">
                  {specName(lead.specialty_id)} · {lawyerName(lead.lawyer_id)}
                </p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <div className="mt-6">
              <CaseTimeline status={lead.status} history={[]} createdAt={lead.created_at} compact />
            </div>
            <p className="mt-5 max-w-[62ch] text-[15px]">{STATUS_HELP[lead.status]}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/panel/solicitudes/${lead.id}`} className="btn btn-secondary bg-navy hover:bg-carbon">
                Ver el detalle y el historial <ArrowRight aria-hidden size={16} />
              </Link>
            </div>
          </Panel>
        ) : (
          <Panel title="Tu primera solicitud" id="caso">
            <ol className="grid gap-4 sm:grid-cols-2">
              {[
                ["Elige la especialidad", "Tránsito, penal, financiero, digital, migratorio o buen nombre."],
                ["Escoge abogado o deja que la firma asigne", "Puedes revisar los perfiles antes de decidir."],
                ["Cuéntanos tu caso", "Qué pasó, cuándo y qué esperas lograr. Toma unos 5 minutos."],
                ["Te contactamos", "Por WhatsApp, llamada o correo, como prefieras."],
              ].map(([t, d]) => (
                <li key={t} className="bg-navy p-4">
                  <p className="text-[15px] font-medium">{t}</p>
                  <p className="mt-1 text-[14px] text-ink-soft">{d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[14px] text-ink-soft">Enviar una solicitud no te compromete a contratar: la relación empieza solo si apruebas una propuesta.</p>
            <Link href="/panel/nueva-solicitud" className="btn btn-primary mt-5">
              Empezar mi solicitud
            </Link>
          </Panel>
        )}

        <div className="grid gap-4">
          <Panel title="Tus solicitudes" id="conteo" action={requests.length ? <PanelLink href="/panel/solicitudes">Ver todas</PanelLink> : undefined}>
            <ul className="grid grid-cols-3 gap-px bg-white/[0.06]">
              {[
                ["Abiertas", open.length, "/panel/solicitudes?estado=abiertas"],
                ["Contactado", contacted, "/panel/solicitudes?estado=contactado"],
                ["Cerradas", closed, "/panel/solicitudes?estado=cerradas"],
              ].map(([label, n, href]) => (
                <li key={label} className="flex bg-graphite [&:not(:first-child)]:pl-4">
                  <Link href={href as string} className="block w-full py-1 pr-3 transition-colors duration-150 hover:text-mist">
                    <span className="block text-[13px] text-ink-soft">{label}</span>
                    <span className="font-display mt-1 block text-[30px] leading-none tabular-nums">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Datos de contacto" id="datos" meta={`${filled} de ${contactFields.length}`}>
            <span aria-hidden className="block h-1 bg-white/[0.08]">
              <span className="block h-full bg-mist" style={{ width: `${(filled / contactFields.length) * 100}%` }} />
            </span>
            <ul className="mt-4 grid gap-2 text-[14px]">
              {contactFields.map((f) => (
                <li key={f.label} className="flex items-center gap-2">
                  {f.done ? <Check aria-hidden size={15} className="text-mist" /> : <span aria-hidden className="ml-1 mr-1 h-1.5 w-1.5 border border-ink-soft" />}
                  <span className={f.done ? "text-ink" : "text-ink-soft"}>{f.label}</span>
                  <span className="sr-only">{f.done ? "(completo)" : "(falta)"}</span>
                </li>
              ))}
            </ul>
            {filled < contactFields.length ? (
              <p className="mt-4 text-[14px] text-ink-soft">
                El equipo necesita tu celular y documento para contactarte y abrir tu caso.{" "}
                <Link href="/panel/perfil" className="link text-ink">
                  Completar mi perfil
                </Link>
              </p>
            ) : (
              <p className="mt-4 text-[14px] text-ink-soft">Tus datos están completos.</p>
            )}
          </Panel>
        </div>
      </div>

      {requests.length > 1 ? (
        <Panel title="Solicitudes recientes" id="recientes" meta={`${requests.length} en total`} action={<PanelLink href="/panel/solicitudes">Ver todas</PanelLink>} className="mt-4" flush>
          <ul className="divide-y divide-white/[0.06]">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/panel/solicitudes/${r.id}`}
                  className="grid gap-x-4 gap-y-1 px-5 py-3.5 transition-colors duration-150 hover:bg-white/[0.03] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">{r.subject}</span>
                    <span className="block truncate text-[13px] text-ink-soft">{specName(r.specialty_id)}</span>
                  </span>
                  <time dateTime={r.created_at} className="text-[13px] tabular-nums text-ink-soft sm:text-right">
                    {fmt.format(new Date(r.created_at))}
                  </time>
                  <span className="sm:justify-self-end">
                    <StatusBadge status={r.status} size="sm" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : !requests.length && !error ? (
        <EmptyState
          className="mt-4"
          title="¿No sabes qué área necesitas?"
          body="Revisa las especialidades y los abogados de la firma antes de escribirnos. También puedes enviar la solicitud y el equipo te orienta."
          action={{ href: "/panel/abogados", label: "Explorar abogados" }}
          secondary={{ href: "/especialidades", label: "Ver especialidades" }}
        />
      ) : null}
    </>
  );
}
