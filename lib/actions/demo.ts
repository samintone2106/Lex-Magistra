"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEMO_ACCOUNTS, demoSwitcherEnabled, type DemoKey } from "@/lib/demo-accounts";

/** Cierra la sesión actual y entra con la cuenta de prueba elegida. Solo en desarrollo local. */
export async function switchDemoAccount(key: DemoKey): Promise<{ ok: false; message: string } | never> {
  if (!demoSwitcherEnabled()) return { ok: false, message: "El cambio de cuenta solo funciona con la base de datos local." };
  const account = DEMO_ACCOUNTS.find((a) => a.key === key);
  if (!account) return { ok: false, message: "Cuenta desconocida." };

  const supabase = await createClient();
  await supabase.auth.signOut();
  const { error } = await supabase.auth.signInWithPassword({ email: account.email, password: process.env.DEMO_PASSWORD! });
  if (error) return { ok: false, message: `No se pudo entrar como ${account.label}. ¿Corriste los datos de prueba?` };

  revalidatePath("/", "layout");
  redirect(account.home);
}
