import { createBrowserClient } from "@supabase/ssr";

/** Cliente de navegador (lee la sesión de las cookies de Supabase). RLS aplica siempre. */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
}
