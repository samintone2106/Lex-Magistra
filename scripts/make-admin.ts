/**
 * Convierte en administrador a un usuario ya registrado.
 * Uso: npm run make-admin -- correo@dominio.com
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local (solo local; NUNCA en el cliente ni en el repo).
 */
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !url || !key) {
  console.error("Uso: npm run make-admin -- correo@dominio.com  (con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local)");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === email);
    if (user) {
      const { error: upErr } = await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
      if (upErr) throw upErr;
      console.log(`Listo: ${email} ahora es administrador.`);
      return;
    }
    if (data.users.length < 200) break;
    page++;
  }
  console.error(`No existe un usuario con el correo ${email}. Regístrate primero en /registro.`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
