"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PUBLIC_DATA_TAG } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";
import { ATTACHMENTS_BUCKET, SIGNED_URL_TTL, isAttachable } from "@/lib/attachments";
import { pathFromPublicUrl } from "@/lib/storage-url";
import {
  ATTACHMENT_MAX,
  ATTACHMENTS_PER_REQUEST,
  AVATAR_MAX,
  DOC_MIMES,
  IMAGE_MIMES,
  LAWYER_PHOTO_MAX,
  checkUpload,
  safeFileName,
  storagePath,
  type ActionState,
} from "@/lib/validation";

const UUID = /^[0-9a-f-]{36}$/i;
const AVATARS = "avatars";
const LAWYER_PHOTOS = "lawyer-photos";

async function requireUser() {
  if (!isSupabaseConfigured()) redirect("/ingresar?config=1");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  return { supabase, user };
}

const tooMany = (userId: string) => !rateLimit(`upload:${userId}`, 40, 60 * 60 * 1000);
const TOO_MANY = "Hiciste muchas subidas seguidas. Espera unos minutos e intenta de nuevo.";

/* ───────── Foto de la cuenta (todos los roles) ───────── */
export async function uploadAvatar(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  if (tooMany(user.id)) return { ok: false, message: TOO_MANY };
  const file = await checkUpload(fd.get("file"), IMAGE_MIMES, AVATAR_MAX);
  if (!file.ok) return { ok: false, errors: { file: file.error }, message: file.error };

  const path = storagePath(user.id, file.ext);
  const bucket = supabase.storage.from(AVATARS);
  const { error: upErr } = await bucket.upload(path, file.bytes, { contentType: file.mime, cacheControl: "31536000", upsert: false });
  if (upErr) return { ok: false, message: "No pudimos subir la foto. Intenta de nuevo." };
  const url = bucket.getPublicUrl(path).data.publicUrl;

  const { data: before } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (error) {
    await bucket.remove([path]);
    return { ok: false, message: "No pudimos guardar la foto en tu perfil." };
  }
  // La foto anterior ya no la usa nadie: se borra (si falla, solo queda un archivo huérfano).
  const old = pathFromPublicUrl(before?.avatar_url, AVATARS);
  if (old && old !== path && old.startsWith(`${user.id}/`)) await bucket.remove([old]);

  revalidatePath("/panel", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Foto actualizada." };
}

/* ───────── Foto pública del abogado (la sube él mismo) ───────── */
export async function uploadOwnLawyerPhoto(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  if (tooMany(user.id)) return { ok: false, message: TOO_MANY };
  const { data: lawyer } = await supabase.from("lawyers").select("id").eq("profile_id", user.id).maybeSingle();
  if (!lawyer) return { ok: false, message: "Tu cuenta no está vinculada a un perfil de abogado." };
  const file = await checkUpload(fd.get("file"), IMAGE_MIMES, LAWYER_PHOTO_MAX);
  if (!file.ok) return { ok: false, errors: { file: file.error }, message: file.error };

  const path = storagePath(lawyer.id, file.ext);
  const bucket = supabase.storage.from(LAWYER_PHOTOS);
  const { error: upErr } = await bucket.upload(path, file.bytes, { contentType: file.mime, cacheControl: "31536000", upsert: false });
  if (upErr) return { ok: false, message: "No pudimos subir la foto. Intenta de nuevo." };
  const url = bucket.getPublicUrl(path).data.publicUrl;

  // Función con permisos acotados: solo cambia photo_url de su propio perfil.
  const { data: previous, error } = await supabase.rpc("set_own_lawyer_photo", { p_url: url });
  if (error) {
    await bucket.remove([path]);
    return { ok: false, message: "No pudimos publicar la foto en tu perfil." };
  }
  // Solo se borra la anterior si estaba en su carpeta (las que subió el admin se conservan).
  const old = pathFromPublicUrl(typeof previous === "string" ? previous : null, LAWYER_PHOTOS);
  if (old && old !== path && old.startsWith(`${lawyer.id}/`)) await bucket.remove([old]);

  revalidatePath("/", "layout");
  revalidateTag(PUBLIC_DATA_TAG);
  return { ok: true, message: "Tu foto pública quedó actualizada." };
}

/* ───────── Documentos de una solicitud ───────── */
function revalidateRequest(requestId: string) {
  revalidatePath(`/panel/solicitudes/${requestId}`);
  revalidatePath(`/admin/solicitudes/${requestId}`);
  revalidatePath("/panel/asignadas");
}

/** Adjunta uno o varios archivos (campo `files`) a una solicitud propia y abierta. */
export async function addRequestAttachments(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const requestId = String(fd.get("request_id") ?? "");
  if (!UUID.test(requestId)) return { ok: false, message: "Solicitud no válida." };
  const files = fd.getAll("files");
  if (!files.length) return { ok: false, errors: { files: "Elige al menos un archivo." }, message: "Elige al menos un archivo." };
  const { supabase, user } = await requireUser();
  if (tooMany(user.id)) return { ok: false, message: TOO_MANY };

  const [{ data: req }, { count }] = await Promise.all([
    supabase.from("consultation_requests").select("id,client_id,status").eq("id", requestId).maybeSingle(),
    supabase.from("request_attachments").select("id", { count: "exact", head: true }).eq("request_id", requestId),
  ]);
  if (!req || req.client_id !== user.id) return { ok: false, message: "Solo quien creó la solicitud puede adjuntar documentos." };
  if (!isAttachable(req.status)) return { ok: false, message: "La solicitud está cerrada: ya no admite documentos nuevos." };
  const free = ATTACHMENTS_PER_REQUEST - (count ?? 0);
  if (files.length > free) {
    const msg = free > 0 ? `Puedes adjuntar ${free} documento${free === 1 ? "" : "s"} más (máximo ${ATTACHMENTS_PER_REQUEST}).` : `Ya tienes ${ATTACHMENTS_PER_REQUEST} documentos, el máximo por solicitud.`;
    return { ok: false, errors: { files: msg }, message: msg };
  }

  // Se valida todo antes de subir nada: o pasan todos o no se sube ninguno.
  const checked = [];
  for (const value of files) {
    const file = await checkUpload(value, DOC_MIMES, ATTACHMENT_MAX);
    const original = value instanceof File ? value.name : "archivo";
    if (!file.ok) return { ok: false, errors: { files: `${original}: ${file.error}` }, message: `${original}: ${file.error}` };
    checked.push({ ...file, name: safeFileName(original, file.ext) });
  }

  const bucket = supabase.storage.from(ATTACHMENTS_BUCKET);
  let saved = 0;
  for (const f of checked) {
    const path = storagePath(requestId, f.ext);
    const { error: upErr } = await bucket.upload(path, f.bytes, { contentType: f.mime, upsert: false });
    if (upErr) break;
    const { error } = await supabase
      .from("request_attachments")
      .insert({ request_id: requestId, uploaded_by: user.id, path, name: f.name, mime: f.mime, size: f.bytes.byteLength });
    if (error) {
      await bucket.remove([path]);
      break;
    }
    saved++;
  }

  if (saved) revalidateRequest(requestId);
  if (saved < checked.length) {
    return { ok: saved > 0, message: saved ? `Se adjuntaron ${saved} de ${checked.length}. Intenta de nuevo con los demás.` : "No pudimos adjuntar el documento. Intenta de nuevo." };
  }
  return { ok: true, message: saved === 1 ? "Documento adjuntado." : `${saved} documentos adjuntados.` };
}

/** Quita un adjunto: el cliente mientras la solicitud siga abierta, o un admin (la RLS lo decide). */
export async function removeRequestAttachment(id: string): Promise<ActionState> {
  if (!UUID.test(id)) return { ok: false, message: "Documento no válido." };
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("request_attachments").delete().eq("id", id).select("path,request_id").maybeSingle();
  if (error || !data) return { ok: false, message: "No puedes quitar este documento." };
  await supabase.storage.from(ATTACHMENTS_BUCKET).remove([data.path]);
  revalidateRequest(data.request_id);
  return { ok: true, message: "Documento quitado." };
}

/** Enlace temporal (5 min) para abrir un adjunto. Primero se comprueba el acceso leyendo la fila con RLS. */
export async function getAttachmentUrl(id: string): Promise<ActionState & { url?: string }> {
  if (!UUID.test(id)) return { ok: false, message: "Documento no válido." };
  const { supabase } = await requireUser();
  const { data: row } = await supabase.from("request_attachments").select("path").eq("id", id).maybeSingle();
  if (!row) return { ok: false, message: "No tienes acceso a este documento." };
  const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(row.path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return { ok: false, message: "No pudimos abrir el documento. Intenta de nuevo." };
  return { ok: true, url: data.signedUrl };
}
