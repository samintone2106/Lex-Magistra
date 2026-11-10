import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface AdminStats {
  clients: number;
  lawyers: number;
  requests_total: number;
  /** Pendientes + en revisión. */
  requests_open: number;
  reviews_pending: number;
  messages_open: number;
  by_specialty: { name: string; total: number }[];
}

/** Una sola llamada a admin_stats por petición: la comparten el layout (contadores del menú) y el resumen. */
export const getAdminStats = cache(async (): Promise<{ stats: AdminStats | null; failed: boolean }> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_stats");
  return { stats: (data as AdminStats | null) ?? null, failed: !!error };
});
