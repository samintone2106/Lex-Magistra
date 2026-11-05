/**
 * Genera supabase/seed.sql a partir del contenido base (especialidades + configuración).
 * Uso: npm run gen:seed
 */
import { writeFileSync } from "node:fs";
import { SPECIALTIES_SEED } from "../lib/content/specialties";
import { DEFAULT_SETTINGS } from "../lib/content/settings";

const lit = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (a: string[]) => `array[${a.map(lit).join(", ")}]::text[]`;

const specialties = SPECIALTIES_SEED.map(
  (s) =>
    `(${[lit(s.slug), lit(s.name), lit(s.short_name), lit(s.icon), lit(s.summary), lit(s.description), arr(s.problems), arr(s.services), `${lit(JSON.stringify(s.faqs))}::jsonb`, s.sort_order].join(", ")})`,
).join(",\n");

const settings = Object.entries(DEFAULT_SETTINGS)
  .map(([k, v]) => `(${lit(k)}, ${lit(v)})`)
  .join(",\n");

const sql = `-- Generado por scripts/gen-seed.ts. No editar a mano.
insert into public.specialties (slug, name, short_name, icon, summary, description, problems, services, faqs, sort_order)
values
${specialties}
on conflict (slug) do nothing;

insert into public.site_settings (key, value)
values
${settings}
on conflict (key) do nothing;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql, "utf8");
console.log(`seed.sql: ${SPECIALTIES_SEED.length} especialidades, ${Object.keys(DEFAULT_SETTINGS).length} ajustes`);
