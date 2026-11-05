/**
 * Escribe .env.local con las llaves del stack local de Supabase (`npm run db:start` primero).
 * Las llaves locales son las de demo de la CLI: sirven solo en 127.0.0.1, nunca en producción.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const raw = execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const status = JSON.parse(raw.slice(raw.indexOf("{"))) as Record<string, string>;
const url = status.API_URL;
const anon = status.ANON_KEY ?? status.PUBLISHABLE_KEY;
const service = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
if (!url || !anon || !service) {
  console.error("No se pudieron leer las llaves. ¿Está corriendo `npm run db:start`?", Object.keys(status));
  process.exit(1);
}

const path = ".env.local";
if (existsSync(path)) writeFileSync(`${path}.bak`, readFileSync(path));
writeFileSync(
  path,
  [
    "# Generado por `npm run db:env` (Supabase local). Copia anterior en .env.local.bak",
    `NEXT_PUBLIC_SUPABASE_URL=${url}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`,
    "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
    `SUPABASE_SERVICE_ROLE_KEY=${service}`,
    "",
  ].join("\n"),
);
console.log(`.env.local listo → ${url}`);
console.log(`Studio: ${status.STUDIO_URL ?? "http://127.0.0.1:54323"} · Correos de prueba: ${status.INBUCKET_URL ?? status.MAILPIT_URL ?? "http://127.0.0.1:54324"}`);
