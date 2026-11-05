"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { formToObject, profileSchema, requestSchema, reviewSchema, zodErrors, type ActionState } from "@/lib/validation";

async function requireUser() {
  if (!isSupabaseConfigured()) redirect("/ingresar?config=1");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  return { supabase, user };
}

export async function updateProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = profileSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  const { supabase, user } = await requireUser();
  const d = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: d.full_name, phone: d.phone || null, document_id: d.document_id || null, city: d.city || null })
    .eq("id", user.id);
  if (error) return { ok: false, message: "No pudimos guardar los cambios." };
  revalidatePath("/panel", "layout");
  return { ok: true, message: "Datos actualizados." };
}

export async function createRequest(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = requestSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  const { supabase, user } = await requireUser();
  if (!rateLimit(`request:${user.id}`, 10, 24 * 60 * 60 * 1000)) {
    return { ok: false, message: "Alcanzaste el límite de solicitudes por hoy. Escríbenos por WhatsApp si es urgente." };
  }
  const d = parsed.data;

  // El abogado elegido debe pertenecer a la especialidad y aceptar consultas.
  if (d.lawyer_id) {
    const { data: link } = await supabase
      .from("lawyer_specialties")
      .select("lawyer_id, lawyers!inner(accepts_consultations,is_active)")
      .eq("lawyer_id", d.lawyer_id)
      .eq("specialty_id", d.specialty_id)
      .maybeSingle();
    if (!link) return { ok: false, message: "El abogado elegido no atiende esa especialidad." };
  }

  const { data, error } = await supabase
    .from("consultation_requests")
    .insert({
      client_id: user.id,
      specialty_id: d.specialty_id,
      lawyer_id: d.lawyer_id || null,
      firm_id: d.firm_id || null,
      subject: d.subject,
      description: d.description,
      preferred_contact: d.preferred_contact,
      data_consent: true,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, message: "No pudimos registrar la solicitud. Intenta de nuevo." };
  revalidatePath("/panel", "layout");
  redirect(`/panel/solicitudes/${data.id}?nueva=1`);
}

export async function cancelRequest(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const { supabase, user } = await requireUser();
  await supabase.from("consultation_requests").update({ status: "cerrado" }).eq("id", id).eq("client_id", user.id).eq("status", "pendiente");
  revalidatePath(`/panel/solicitudes/${id}`);
  revalidatePath("/panel/solicitudes");
}

export async function createReview(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = reviewSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  const { supabase, user } = await requireUser();
  if (!rateLimit(`review:${user.id}`, 3, 24 * 60 * 60 * 1000)) return { ok: false, message: "Ya enviaste varias reseñas hoy." };
  const d = parsed.data;
  const { error } = await supabase.from("reviews").insert({
    author_id: user.id,
    rating: d.rating,
    comment: d.comment,
    public_name: d.public_name,
    show_name: d.show_name === "on",
    lawyer_id: d.lawyer_id || null,
    specialty_id: d.specialty_id || null,
  });
  if (error) return { ok: false, message: "No pudimos enviar la reseña." };
  revalidatePath("/panel/resenas/nueva");
  return { ok: true, message: "Gracias. Tu opinión quedó pendiente de moderación y se publicará cuando sea aprobada." };
}
