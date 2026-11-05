"use server";

import { headers } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { contactSchema, formToObject, zodErrors, type ActionState } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function sendContactMessage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  if (parsed.data.website) return { ok: true, message: "Mensaje recibido." }; // bot: fingimos éxito

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return { ok: false, message: "Has enviado varios mensajes en poco tiempo. Intenta de nuevo más tarde o escríbenos por WhatsApp." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "El formulario aún no está conectado a la base de datos. Escríbenos por WhatsApp." };
  }

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: d.full_name,
    email: d.email,
    phone: d.phone || null,
    specialty_id: d.specialty_id && /^[0-9a-f-]{36}$/i.test(d.specialty_id) ? d.specialty_id : null,
    message: d.message,
    data_consent: true,
  });
  if (error) return { ok: false, message: "No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos." };
  return { ok: true, message: "Gracias. Recibimos tu mensaje y un asesor te contactará pronto." };
}
