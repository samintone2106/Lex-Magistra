import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { AttachmentView, RequestAttachment } from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const ATTACHMENTS_BUCKET = "request-files";
/** Segundos de validez de cada enlace firmado (miniaturas y "Abrir"). */
export const SIGNED_URL_TTL = 300;

/**
 * Adjuntos de una o varias solicitudes, agrupados por solicitud. La RLS decide qué filas ve
 * quien consulta; las imágenes traen una miniatura firmada de corta duración.
 */
export async function getAttachments(supabase: Supabase, requestIds: string[]): Promise<Record<string, AttachmentView[]>> {
  const out: Record<string, AttachmentView[]> = {};
  if (!requestIds.length) return out;
  const { data, error } = await supabase
    .from("request_attachments")
    .select("id,request_id,uploaded_by,path,name,mime,size,created_at")
    .in("request_id", requestIds)
    .order("created_at");
  if (error || !data?.length) return out;
  const rows = data as RequestAttachment[];

  const images = rows.filter((r) => r.mime.startsWith("image/")).map((r) => r.path);
  const thumbs = new Map<string, string>();
  if (images.length) {
    const { data: signed } = await supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrls(images, SIGNED_URL_TTL);
    for (const s of signed ?? []) if (s.path && s.signedUrl) thumbs.set(s.path, s.signedUrl);
  }
  for (const r of rows) (out[r.request_id] ??= []).push({ ...r, thumbUrl: thumbs.get(r.path) ?? null });
  return out;
}

/** Estados en los que el cliente todavía puede aportar o retirar documentos (igual que la RLS). */
export const isAttachable = (status: string) => status !== "cerrado" && status !== "rechazado";
