"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PUBLIC_DATA_TAG } from "@/lib/data";
import { SETTING_KEYS } from "@/lib/content/settings";
import {
  IMAGE_MIMES,
  LAWYER_PHOTO_MAX,
  checkUpload,
  firmSchema,
  formToObject,
  lawyerSchema,
  lines,
  specialtySchema,
  zodErrors,
  type ActionState,
} from "@/lib/validation";
import type { RequestStatus, ReviewStatus, UserRole } from "@/lib/types";

const UUID = /^[0-9a-f-]{36}$/i;

/** Verifica en servidor que quien llama es admin (además de RLS). */
async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect("/ingresar?config=1");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?next=/admin");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") redirect("/panel");
  return { supabase, user };
}

/** Admin o abogado asignado (la RLS y el trigger deciden el resto). */
async function requireStaff() {
  if (!isSupabaseConfigured()) redirect("/ingresar?config=1");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  return { supabase, user };
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidateTag(PUBLIC_DATA_TAG);
}

/* ───────── Abogados ───────── */
export async function saveLawyer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const raw = formToObject(fd);
  const parsed = lawyerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  const d = parsed.data;
  const id = raw.id && UUID.test(raw.id) ? raw.id : null;
  const specialtyIds = fd.getAll("specialty_ids").map(String).filter((s) => UUID.test(s));

  let photoUrl = d.photo_url || null;
  const photo = fd.get("photo");
  if (photo instanceof File && photo.size > 0) {
    // Tipo comprobado por los primeros bytes, no solo por el MIME que declara el navegador.
    const file = await checkUpload(photo, IMAGE_MIMES, LAWYER_PHOTO_MAX);
    if (!file.ok) return { ok: false, errors: { photo: file.error }, message: "Revisa los campos marcados." };
    const path = `${crypto.randomUUID()}.${file.ext}`;
    const { error: upErr } = await supabase.storage.from("lawyer-photos").upload(path, file.bytes, { contentType: file.mime });
    if (upErr) return { ok: false, message: "No pudimos subir la foto." };
    photoUrl = supabase.storage.from("lawyer-photos").getPublicUrl(path).data.publicUrl;
  }

  const row = {
    full_name: d.full_name,
    title: d.title,
    firm_id: d.firm_id || null,
    bio: d.bio,
    experience: d.experience,
    education: d.education,
    services: lines(d.services),
    years_experience: d.years_experience === "" || d.years_experience === undefined ? null : Number(d.years_experience),
    professional_card: d.professional_card || null,
    availability: d.availability || "Disponible para consultas",
    accepts_consultations: d.accepts_consultations === "on",
    is_active: d.is_active === "on",
    photo_url: photoUrl,
    profile_id: d.profile_id || null,
  };

  const res = id
    ? await supabase.from("lawyers").update(row).eq("id", id).select("id").single()
    : await supabase.from("lawyers").insert(row).select("id").single();
  if (res.error || !res.data) {
    const dup = /profile_id|unique/i.test(res.error?.message ?? "");
    return { ok: false, message: dup ? "Esa cuenta ya está vinculada a otro perfil de abogado." : "No pudimos guardar el perfil." };
  }
  const lawyerId = res.data.id as string;

  await supabase.from("lawyer_specialties").delete().eq("lawyer_id", lawyerId);
  if (specialtyIds.length) {
    const { error } = await supabase.from("lawyer_specialties").insert(specialtyIds.map((specialty_id) => ({ lawyer_id: lawyerId, specialty_id })));
    if (error) return { ok: false, message: "Perfil guardado, pero no pudimos asignar las especialidades." };
  }
  revalidatePublic();
  redirect(`/admin/abogados?ok=${id ? "editado" : "creado"}`);
}

export async function deleteLawyer(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) return;
  await supabase.from("lawyers").delete().eq("id", id);
  revalidatePublic();
  redirect("/admin/abogados?ok=eliminado");
}

/* ───────── Firmas ───────── */
export async function saveFirm(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const raw = formToObject(fd);
  const parsed = firmSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  const d = parsed.data;
  const row = { name: d.name, description: d.description, city: d.city || null, website: d.website || null, is_active: d.is_active === "on" };
  const id = raw.id && UUID.test(raw.id) ? raw.id : null;
  const { error } = id ? await supabase.from("firms").update(row).eq("id", id) : await supabase.from("firms").insert(row);
  if (error) return { ok: false, message: "No pudimos guardar la firma." };
  revalidatePublic();
  revalidatePath("/admin/firmas");
  return { ok: true, message: id ? "Firma actualizada." : "Firma registrada." };
}

export async function deleteFirm(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) return;
  await supabase.from("firms").delete().eq("id", id);
  revalidatePublic();
  revalidatePath("/admin/firmas");
}

/* ───────── Especialidades ───────── */
export async function saveSpecialty(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const raw = formToObject(fd);
  const parsed = specialtySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  const d = parsed.data;

  // FAQs: bloques "P: … / R: …" separados por línea en blanco.
  const faqs = d.faqs
    .split(/\n\s*\n/)
    .map((block) => {
      const q = block.match(/^P:\s*(.+)$/m)?.[1]?.trim();
      const a = block.match(/^R:\s*([\s\S]+)$/m)?.[1]?.trim();
      return q && a ? { q, a } : null;
    })
    .filter(Boolean);

  const row = {
    name: d.name,
    short_name: d.short_name,
    slug: d.slug,
    icon: d.icon,
    summary: d.summary,
    description: d.description,
    problems: lines(d.problems),
    services: lines(d.services),
    faqs,
    sort_order: d.sort_order,
    is_active: d.is_active === "on",
  };
  const id = raw.id && UUID.test(raw.id) ? raw.id : null;
  const { error } = id ? await supabase.from("specialties").update(row).eq("id", id) : await supabase.from("specialties").insert(row);
  if (error) {
    return { ok: false, message: /duplicate|unique/i.test(error.message) ? "Ya existe una especialidad con esa URL." : "No pudimos guardar la especialidad." };
  }
  revalidatePublic();
  redirect(`/admin/especialidades?ok=${id ? "editada" : "creada"}`);
}

/* ───────── Usuarios ───────── */
export async function setUserRole(fd: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const role = String(fd.get("role") ?? "") as UserRole;
  if (!UUID.test(id) || !["client", "lawyer", "admin"].includes(role) || id === user.id) return;
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

/* ───────── Solicitudes ───────── */
export async function updateRequest(fd: FormData) {
  const { supabase } = await requireStaff();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "") as RequestStatus;
  if (!UUID.test(id) || !["pendiente", "en_revision", "contactado", "cerrado", "rechazado"].includes(status)) return;
  const patch: Record<string, unknown> = { status };
  const notes = fd.get("admin_notes");
  if (typeof notes === "string") patch.admin_notes = notes.slice(0, 4000) || null;
  const lawyer = fd.get("lawyer_id");
  if (typeof lawyer === "string") patch.lawyer_id = UUID.test(lawyer) ? lawyer : null;
  await supabase.from("consultation_requests").update(patch).eq("id", id);
  revalidatePath("/admin/solicitudes");
  revalidatePath(`/admin/solicitudes/${id}`);
  revalidatePath("/panel/asignadas");
}

/* ───────── Reseñas ───────── */
export async function moderateReview(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "") as ReviewStatus;
  if (!UUID.test(id) || !["pendiente", "aprobada", "rechazada"].includes(status)) return;
  await supabase.from("reviews").update({ status }).eq("id", id);
  revalidatePublic();
  revalidatePath("/admin/resenas");
}

export async function deleteReview(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) return;
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePublic();
  revalidatePath("/admin/resenas");
}

/* ───────── Mensajes de contacto ───────── */
export async function toggleMessage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) return;
  await supabase.from("contact_messages").update({ handled: fd.get("handled") === "true" }).eq("id", id);
  revalidatePath("/admin/mensajes");
}

/* ───────── Configuración ───────── */
export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const errors: Record<string, string> = {};
  const rows = SETTING_KEYS.map((key) => {
    const value = String(fd.get(key) ?? "").trim().slice(0, 4000);
    return { key, value };
  });
  const get = (k: string) => rows.find((r) => r.key === k)?.value ?? "";
  const wa = get("whatsapp_number").replace(/\D/g, "");
  if (wa && (wa.length < 8 || wa.length > 15)) errors.whatsapp_number = "Número en formato internacional, sin +. Ej.: 573001234567";
  if (!get("firm_name")) errors.firm_name = "El nombre es obligatorio";
  for (const k of ["instagram_url", "facebook_url", "linkedin_url"]) {
    const v = get(k);
    if (v && !/^https:\/\//.test(v)) errors[k] = "Debe empezar por https://";
  }
  const email = get("contact_email");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.contact_email = "Correo no válido";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Revisa los campos marcados." };

  const normalized = rows.map((r) => (r.key === "whatsapp_number" ? { ...r, value: wa } : r));
  const { error } = await supabase.from("site_settings").upsert(normalized.map((r) => ({ ...r, updated_at: new Date().toISOString() })));
  if (error) return { ok: false, message: "No pudimos guardar la configuración." };
  revalidatePublic();
  return { ok: true, message: "Configuración guardada. Los cambios ya se ven en el sitio." };
}
