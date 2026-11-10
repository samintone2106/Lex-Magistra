import { z } from "zod";

const phone = z
  .string()
  .trim()
  .max(30, "Máximo 30 caracteres")
  .regex(/^[+\d\s()-]*$/, "Solo números, espacios y + ( ) -")
  .optional()
  .or(z.literal(""));

const consent = z.literal("on", { error: "Debes aceptar la política de tratamiento de datos" });

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Escribe tu nombre").max(120),
  email: z.email("Correo no válido").max(160),
  phone,
  specialty_id: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000),
  data_consent: consent,
  website: z.string().max(0).optional(), // honeypot
});

const password = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[A-Za-z]/, "Incluye al menos una letra")
  .regex(/\d/, "Incluye al menos un número");

export const signUpSchema = z
  .object({
    full_name: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
    email: z.email("Correo no válido"),
    phone,
    password,
    password_confirm: z.string(),
    data_consent: consent,
  })
  .refine((d) => d.password === d.password_confirm, {
    path: ["password_confirm"],
    message: "Las contraseñas no coinciden",
  });

export const signInSchema = z.object({
  email: z.email("Correo no válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export const emailSchema = z.object({ email: z.email("Correo no válido") });

export const newPasswordSchema = z
  .object({
    password,
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    path: ["password_confirm"],
    message: "Las contraseñas no coinciden",
  });

export const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
  phone,
  document_id: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
});

const uuid = z.uuid("Selección no válida");

export const requestSchema = z.object({
  specialty_id: uuid,
  lawyer_id: uuid.optional().or(z.literal("")),
  firm_id: uuid.optional().or(z.literal("")),
  subject: z.string().trim().min(5, "Escribe un asunto (mínimo 5 caracteres)").max(140),
  description: z.string().trim().min(20, "Describe tu caso (mínimo 20 caracteres)").max(4000),
  preferred_contact: z.enum(["whatsapp", "llamada", "correo"]),
  data_consent: consent,
  no_relationship_ack: z.literal("on", { error: "Debes confirmar que leíste este aviso" }),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Elige de 1 a 5 estrellas").max(5),
  comment: z.string().trim().min(20, "Mínimo 20 caracteres").max(1500),
  public_name: z.string().trim().min(2, "Escribe cómo quieres aparecer").max(80),
  show_name: z.enum(["on"]).optional(),
  lawyer_id: uuid.optional().or(z.literal("")),
  specialty_id: uuid.optional().or(z.literal("")),
});

export const lawyerSchema = z.object({
  full_name: z.string().trim().min(3).max(120),
  title: z.string().trim().min(2).max(120),
  firm_id: uuid.optional().or(z.literal("")),
  bio: z.string().trim().max(4000),
  experience: z.string().trim().max(4000),
  education: z.string().trim().max(4000),
  services: z.string().max(4000),
  years_experience: z.coerce.number().int().min(0).max(70).optional().or(z.literal("")),
  professional_card: z.string().trim().max(40).optional().or(z.literal("")),
  availability: z.string().trim().max(200),
  accepts_consultations: z.enum(["on"]).optional(),
  is_active: z.enum(["on"]).optional(),
  photo_url: z.url().optional().or(z.literal("")),
  profile_id: uuid.optional().or(z.literal("")),
});

export const firmSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  website: z.url("URL no válida").optional().or(z.literal("")),
  is_active: z.enum(["on"]).optional(),
});

export const specialtySchema = z.object({
  name: z.string().trim().min(2).max(120),
  short_name: z.string().trim().min(2).max(60),
  slug: z.string().regex(/^[a-z0-9-]{2,60}$/, "Solo minúsculas, números y guiones"),
  icon: z.string().max(30),
  summary: z.string().trim().max(400),
  description: z.string().trim().max(6000),
  problems: z.string().max(6000),
  services: z.string().max(6000),
  faqs: z.string().max(12000),
  sort_order: z.coerce.number().int().min(0).max(999),
  is_active: z.enum(["on"]).optional(),
});

/** Convierte un FormData a objeto plano (último valor gana). */
export function formToObject(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  fd.forEach((v, k) => {
    if (typeof v === "string") out[k] = v;
  });
  return out;
}

export type FieldErrors = Record<string, string>;

export function zodErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Líneas de un textarea → array limpio. */
export const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export interface ActionState {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
}

export const initialState: ActionState = { ok: false };

/* ───────── Archivos subidos ───────── */

export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DOC_MIMES = [...IMAGE_MIMES, "application/pdf"] as const;
export type UploadMime = (typeof DOC_MIMES)[number];

export const MB = 1024 * 1024;
export const AVATAR_MAX = 2 * MB;
export const LAWYER_PHOTO_MAX = 3 * MB;
export const ATTACHMENT_MAX = 10 * MB;
export const ATTACHMENTS_PER_REQUEST = 5;

const EXT: Record<UploadMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/** Tipo real del archivo según sus primeros bytes (no se confía en el MIME que manda el navegador). */
export function sniffMime(head: Uint8Array): UploadMime | null {
  const at = (i: number, bytes: number[]) => bytes.every((b, k) => head[i + k] === b);
  if (at(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (at(0, [0x52, 0x49, 0x46, 0x46]) && at(8, [0x57, 0x45, 0x42, 0x50])) return "image/webp"; // RIFF....WEBP
  if (at(0, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf"; // %PDF-
  return null;
}

export type CheckedFile = { ok: true; mime: UploadMime; ext: string; bytes: Uint8Array } | { ok: false; error: string };

/**
 * Valida un archivo subido: presencia, tamaño, MIME en la lista permitida y que los bytes
 * coincidan con ese tipo. Devuelve los bytes para subirlos tal cual se verificaron.
 */
export async function checkUpload(value: FormDataEntryValue | null, allowed: readonly UploadMime[], maxBytes: number): Promise<CheckedFile> {
  if (!(value instanceof File) || value.size === 0) return { ok: false, error: "Elige un archivo." };
  const maxMb = Math.round(maxBytes / MB);
  if (value.size > maxBytes) return { ok: false, error: `El archivo supera ${maxMb} MB.` };
  const kinds = allowed.includes("application/pdf") ? "JPG, PNG, WEBP o PDF" : "JPG, PNG o WEBP";
  if (!(allowed as readonly string[]).includes(value.type)) return { ok: false, error: `Formato no permitido. Usa ${kinds}.` };
  const bytes = new Uint8Array(await value.arrayBuffer());
  const real = sniffMime(bytes.subarray(0, 16));
  // Un JPG renombrado a .png se acepta como lo que realmente es; un ejecutable con extensión .pdf no.
  if (!real || !allowed.includes(real)) return { ok: false, error: `El contenido no corresponde a un ${kinds} válido.` };
  return { ok: true, mime: real, ext: EXT[real], bytes };
}

/** Nombre visible seguro: sin rutas, sin caracteres de control ni reservados, máximo 160. */
export function safeFileName(name: string, ext: string): string {
  const base = (name.split(/[\\/]/).pop() ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "");
  const stem = base.replace(/\.[^.]*$/, "").slice(0, 150) || "documento";
  return `${stem}.${ext}`;
}

/** Ruta de Storage con un segmento aleatorio: nunca colisiona ni revela el nombre original. */
export const storagePath = (folder: string, ext: string) => `${folder}/${crypto.randomUUID()}.${ext}`;
