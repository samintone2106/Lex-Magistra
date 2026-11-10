import { createClient } from "@/lib/supabase/server";
import { toggleMessage } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { relativeDay } from "@/components/panel/CaseTimeline";
import { SubmitButton } from "@/components/ui/Form";
import { FilterTabs } from "@/components/ui/Panel";
import { BlockError, EmptyState } from "@/components/ui/States";
import { whatsappUrl } from "@/lib/whatsapp";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

interface Msg {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  handled: boolean;
  created_at: string;
  specialty: { short_name: string } | null;
}

const VIEWS = [
  { key: "", label: "Todos", match: () => true },
  { key: "pendientes", label: "Sin atender", match: (m: Msg) => !m.handled },
  { key: "atendidos", label: "Atendidos", match: (m: Msg) => m.handled },
];

export default async function AdminMensajes({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { vista } = await searchParams;
  const view = VIEWS.find((v) => v.key === (vista ?? "")) ?? VIEWS[0];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*, specialty:specialties(short_name)")
    .order("handled")
    .order("created_at", { ascending: false })
    .limit(200);
  const all = (data ?? []) as Msg[];
  const rows = all.filter(view.match);
  const open = all.filter((m) => !m.handled).length;

  return (
    <>
      <PanelTitle
        title="Mensajes de contacto"
        lead={
          open
            ? `${open} ${open === 1 ? "mensaje" : "mensajes"} del formulario público sin atender. Responde por correo o WhatsApp y márcalos como atendidos.`
            : "Todos los mensajes del formulario público están atendidos."
        }
      />
      <FilterTabs
        label="Filtrar mensajes"
        items={VIEWS.map((v) => ({ href: v.key ? `/admin/mensajes?vista=${v.key}` : "/admin/mensajes", label: v.label, count: all.filter(v.match).length, active: v.key === view.key }))}
      />
      <div className="mt-6">
        {error ? (
          <BlockError what="los mensajes" retryHref="/admin/mensajes" />
        ) : rows.length ? (
          <ul className="grid gap-3">
            {rows.map((m) => {
              const wa = m.phone ? whatsappUrl(m.phone, `Hola ${m.full_name}, le escribimos por su mensaje en nuestro sitio.`) : null;
              return (
                <li key={m.id} className={`p-5 ${m.handled ? "bg-carbon outline outline-1 -outline-offset-1 outline-white/[0.07]" : "bg-graphite"}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-[16px] font-semibold">
                      {m.full_name}
                      {m.specialty ? <span className="ml-2 text-[14px] font-normal text-ink-soft">· {m.specialty.short_name}</span> : null}
                    </p>
                    <p className="text-[13px] tabular-nums text-ink-soft">
                      <time dateTime={m.created_at}>{fmt.format(new Date(m.created_at))}</time> · {relativeDay(m.created_at)}
                    </p>
                  </div>
                  <p className={`mt-3 max-w-[80ch] whitespace-pre-line text-[15px] leading-relaxed ${m.handled ? "text-ink-soft" : ""}`}>{m.message}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                      <a className="link" href={`mailto:${m.email}`}>
                        {m.email}
                      </a>
                      {m.phone ? (
                        wa ? (
                          <a className="link" href={wa} target="_blank" rel="noopener noreferrer">
                            WhatsApp {m.phone}
                          </a>
                        ) : (
                          <span>{m.phone}</span>
                        )
                      ) : (
                        <span className="text-ink-soft">Sin teléfono</span>
                      )}
                    </p>
                    <form action={toggleMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="handled" value={m.handled ? "false" : "true"} />
                      <SubmitButton className={`btn min-h-10 text-[14px] ${m.handled ? "btn-ghost text-ink-soft" : "btn-secondary bg-navy hover:bg-carbon"}`} pending="Guardando…">
                        {m.handled ? "Volver a sin atender" : "Marcar como atendido"}
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title={view.key === "pendientes" ? "No hay mensajes sin atender." : "No hay mensajes en esta vista."}
            body="Los mensajes llegan desde el formulario de la página de contacto."
            action={view.key ? { href: "/admin/mensajes", label: "Ver todos" } : undefined}
          />
        )}
      </div>
    </>
  );
}
