"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  emailSchema,
  formToObject,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
  zodErrors,
  type ActionState,
} from "@/lib/validation";

const NOT_CONFIGURED: ActionState = {
  ok: false,
  message: "La autenticación aún no está conectada. Configura las variables de Supabase en .env.local.",
};

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/** Solo rutas internas para evitar redirecciones abiertas. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/panel";
}

export async function signUp(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  if (!rateLimit(`signup:${await clientIp()}`, 5, 60 * 60 * 1000)) return { ok: false, message: "Demasiados intentos. Intenta más tarde." };

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: d.email,
    password: d.password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/panel`,
      data: { full_name: d.full_name, phone: d.phone || null, data_consent: "true" },
    },
  });
  if (error) {
    const msg = /registered|exists/i.test(error.message)
      ? "Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña."
      : "No pudimos crear la cuenta. Intenta de nuevo.";
    return { ok: false, message: msg };
  }
  if (data.session) redirect("/panel");
  return { ok: true, message: "Te enviamos un correo para confirmar tu cuenta. Abre el enlace para activarla." };
}

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formToObject(fd);
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  if (!rateLimit(`signin:${await clientIp()}:${parsed.data.email}`, 8, 15 * 60 * 1000)) {
    return { ok: false, message: "Demasiados intentos. Espera unos minutos o recupera tu contraseña." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const msg = /confirm/i.test(error.message)
      ? "Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada."
      : "Correo o contraseña incorrectos.";
    return { ok: false, message: msg };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(raw.next));
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  if (!rateLimit(`reset:${await clientIp()}`, 5, 60 * 60 * 1000)) return { ok: false, message: "Demasiados intentos. Intenta más tarde." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/restablecer`,
  });
  // Misma respuesta exista o no la cuenta (no revelar correos registrados).
  return { ok: true, message: "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña." };
}

export async function updatePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Revisa los campos marcados." };
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "El enlace expiró. Solicita uno nuevo desde Recuperar contraseña." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "No pudimos actualizar la contraseña. Intenta con otra." };
  redirect("/panel?clave=1");
}
