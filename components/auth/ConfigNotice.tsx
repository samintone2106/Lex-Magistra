import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Notice } from "@/components/ui/States";

/** Aviso visible solo mientras la base de datos no esté configurada. */
export function ConfigNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <Notice tone="warning" className="mb-6">
      La plataforma aún no está conectada a Supabase. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.
    </Notice>
  );
}
