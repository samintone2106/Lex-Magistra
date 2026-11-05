import { createClient } from "@/lib/supabase/server";
import { toggleMessage } from "@/lib/actions/admin";
import { PanelTitle } from "@/components/panel/Shell";
import { SubmitButton } from "@/components/ui/Form";
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

export default async function AdminMensajes() {
  const supabase = await createClient();
  const { data } = await supabase.from("contact_messages").select("*, specialty:specialties(short_name)").order("handled").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Msg[];
  return (
    <>
      <PanelTitle title="Mensajes de contacto" lead="Mensajes del formulario público. Márcalos como atendidos cuando respondas." />
      <ul className="space-y-4">
        {rows.map((m) => {
          const wa = m.phone ? whatsappUrl(m.phone) : null;
          return (
            <li key={m.id} className={`p-5 ${m.handled ? "bg-carbon" : "bg-graphite"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[17px] font-medium">{m.full_name}</p>
                <span className="text-[14px] text-ink-soft">{fmt.format(new Date(m.created_at))}</span>
              </div>
              <p className="mt-1 text-[14px] text-ink-soft">
                <a className="link" href={`mailto:${m.email}`}>{m.email}</a>
                {m.phone ? <> · {wa ? <a className="link" href={wa} target="_blank" rel="noopener noreferrer">{m.phone}</a> : m.phone}</> : null}
                {m.specialty ? ` · ${m.specialty.short_name}` : ""}
              </p>
              <p className="mt-3 whitespace-pre-line text-[16px]">{m.message}</p>
              <form action={toggleMessage} className="mt-4">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled ? "false" : "true"} />
                <SubmitButton className="btn btn-secondary" pending="…">{m.handled ? "Marcar como pendiente" : "Marcar como atendido"}</SubmitButton>
              </form>
            </li>
          );
        })}
      </ul>
      {!rows.length ? <p className="bg-graphite p-6 text-ink-soft">No hay mensajes.</p> : null}
    </>
  );
}
