import { isSupabaseConfigured } from "@/lib/supabase/server";

/** Aviso visible solo mientras la base de datos no esté configurada. */
export function ConfigNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <p role="status" className="mb-6 bg-navy p-4 text-[15px]">
      La plataforma aún no está conectada a Supabase. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.
    </p>
  );
}
