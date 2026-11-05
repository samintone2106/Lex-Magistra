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
