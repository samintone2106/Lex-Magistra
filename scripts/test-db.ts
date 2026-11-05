/**
 * Prueba la migración y las políticas RLS en un Postgres en memoria (PGlite), sin Supabase.
 * Simula auth.uid() y los roles anon/authenticated de Supabase.
 * Uso: npm run test:db
 */
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let failures = 0;
let passes = 0;

function ok(cond: boolean, name: string) {
  if (cond) {
    passes++;
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.log(`  ✗ ${name}`);
  }
}

async function expectError(sql: string, name: string) {
  try {
    await db.exec(sql);
    ok(false, name);
  } catch {
    ok(true, name);
  }
}

async function as(user: string | null, role: "anon" | "authenticated" = "authenticated") {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ""}', false); set role ${user ? role : "anon"};`);
}

const U = {
  admin: "00000000-0000-0000-0000-00000000000a",
  ana: "00000000-0000-0000-0000-0000000000a1",
  beto: "00000000-0000-0000-0000-0000000000b2",
  law: "00000000-0000-0000-0000-0000000000c3",
};

async function main() {
  // ── Stubs de Supabase
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);

  const dir = new URL("../supabase/migrations/", import.meta.url);
  for (const f of readdirSync(dir).sort()) {
    await db.exec(readFileSync(new URL(f, dir), "utf8").replace(/create extension if not exists pgcrypto;/, ""));
    console.log(`migración aplicada: ${f}`);
  }
  await db.exec(readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8"));

  // ── Usuarios (trigger handle_new_user crea perfiles)
  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${U.admin}', 'admin@x.co', '{"full_name":"Admin"}'),
      ('${U.ana}', 'ana@x.co', '{"full_name":"Ana Cliente","data_consent":"true"}'),
      ('${U.beto}', 'beto@x.co', '{"full_name":"Beto Cliente"}'),
      ('${U.law}', 'law@x.co', '{"full_name":"Laura Abogada"}');
    update public.profiles set role = 'admin' where id = '${U.admin}';
  `);

  console.log("\nCatálogo y perfiles");
  const spec = (await db.query<{ id: string }>(`select id from public.specialties where slug = 'derecho-penal'`)).rows[0].id;
  ok(!!spec, "seed: 6 especialidades cargadas");
  const p = await db.query<{ role: string; data_consent_at: string | null }>(`select role, data_consent_at from public.profiles where id='${U.ana}'`);
  ok(p.rows[0].role === "client" && !!p.rows[0].data_consent_at, "nuevo usuario = cliente con consentimiento registrado");

  await as(null);
  const anonSpecs = await db.query(`select * from public.specialties`);
  ok(anonSpecs.rows.length === 6, "anon lee especialidades");
  await expectError(`insert into public.specialties (slug,name,short_name) values ('x-y','X','X')`, "anon NO crea especialidades");
  await expectError(`select 1 from public.profiles limit 1; insert into public.profiles (id) values ('${U.beto}')`, "anon NO inserta perfiles");

  // ── Roles
  console.log("\nRoles");
  await as(U.ana);
  await expectError(`update public.profiles set role='admin' where id='${U.ana}'`, "cliente NO se auto-asigna admin");
  await db.exec(`update public.profiles set phone='3001234567' where id='${U.ana}'`);
  ok((await db.query(`select 1 from public.profiles where id='${U.ana}' and phone='3001234567'`)).rows.length === 1, "cliente edita su teléfono");
  const others = await db.query(`select id from public.profiles where id <> '${U.ana}'`);
  ok(others.rows.length === 0, "cliente NO ve otros perfiles");

  // ── Admin crea abogado vinculado
  await as(U.admin);
  await db.exec(`update public.profiles set role='lawyer' where id='${U.law}'`);
  const lawyerId = (await db.query<{ id: string }>(`insert into public.lawyers (full_name, profile_id) values ('Laura Abogada', '${U.law}') returning id`)).rows[0].id;
  await db.exec(`insert into public.lawyer_specialties values ('${lawyerId}', '${spec}')`);
  ok(true, "admin crea abogado y asigna especialidad");

  // ── Solicitudes
  console.log("\nSolicitudes");
  await as(U.ana);
  const reqId = (
    await db.query<{ id: string }>(
      `insert into public.consultation_requests (client_id, specialty_id, lawyer_id, subject, description, data_consent)
       values ('${U.ana}', '${spec}', '${lawyerId}', 'Citación Fiscalía', 'Me citaron a interrogatorio la próxima semana y necesito orientación.', true) returning id`,
    )
  ).rows[0].id;
  ok(!!reqId, "cliente crea su solicitud");
  ok((await db.query(`select * from public.request_status_history where request_id='${reqId}'`)).rows.length === 1, "historial inicial creado");
  await expectError(
    `insert into public.consultation_requests (client_id, specialty_id, subject, description, data_consent) values ('${U.beto}', '${spec}', 'Suplantar', 'Intento crear una solicitud a nombre de otro usuario.', true)`,
    "cliente NO crea solicitudes a nombre de otro",
  );
  await expectError(
    `insert into public.consultation_requests (client_id, specialty_id, subject, description, data_consent) values ('${U.ana}', '${spec}', 'Sin consentimiento', 'Solicitud sin autorizar el tratamiento de datos.', false)`,
    "solicitud sin consentimiento rechazada",
  );
  await expectError(`update public.consultation_requests set status='contactado' where id='${reqId}'`, "cliente NO cambia el estado");
  await expectError(`update public.consultation_requests set admin_notes='hack' where id='${reqId}'`, "cliente NO escribe notas internas");

  await as(U.beto);
  ok((await db.query(`select * from public.consultation_requests`)).rows.length === 0, "otro cliente NO ve la solicitud");
  ok((await db.query(`select * from public.request_status_history`)).rows.length === 0, "otro cliente NO ve el historial");
  await db.exec(`update public.consultation_requests set subject='hackeado' where id='${reqId}'`);
  await as(U.admin);
  ok((await db.query(`select 1 from public.consultation_requests where subject='hackeado'`)).rows.length === 0, "otro cliente NO modifica la solicitud");

  await as(U.law);
  ok((await db.query(`select * from public.consultation_requests`)).rows.length === 1, "abogado asignado ve la solicitud");
  ok((await db.query(`select full_name from public.profiles where id='${U.ana}'`)).rows.length === 1, "abogado ve datos del cliente asignado");
  ok((await db.query(`select 1 from public.profiles where id='${U.beto}'`)).rows.length === 0, "abogado NO ve clientes no asignados");
  await db.exec(`update public.consultation_requests set status='en_revision' where id='${reqId}'`);
  ok((await db.query(`select * from public.request_status_history where request_id='${reqId}'`)).rows.length === 2, "abogado cambia estado y queda en historial");

  await as(U.admin);
  await db.exec(`update public.consultation_requests set status='contactado', admin_notes='Llamar el lunes' where id='${reqId}'`);
  ok((await db.query(`select 1 from public.consultation_requests where status='contactado'`)).rows.length === 1, "admin cambia estado y notas");

  // ── Reseñas
  console.log("\nReseñas");
  await as(U.ana);
  const revId = (
    await db.query<{ id: string }>(
      `insert into public.reviews (author_id, rating, comment, public_name, status) values ('${U.ana}', 5, 'Excelente atención, me explicaron todo con claridad.', 'Ana C.', 'aprobada') returning id`,
    )
  ).rows[0].id;
  ok((await db.query(`select status from public.reviews where id='${revId}'`)).rows[0] !== undefined, "cliente envía reseña");
  await as(U.admin);
  ok((await db.query<{ status: string }>(`select status from public.reviews where id='${revId}'`)).rows[0].status === "pendiente", "reseña queda pendiente aunque intente auto-aprobarse");
  await as(null);
  ok((await db.query(`select * from public.reviews`)).rows.length === 0, "anon NO ve reseñas pendientes");
  await as(U.ana);
  await db.exec(`update public.reviews set status='aprobada' where id='${revId}'`).catch(() => undefined);
  await as(U.admin);
  ok((await db.query<{ status: string }>(`select status from public.reviews where id='${revId}'`)).rows[0].status === "pendiente", "autor NO aprueba su reseña");
  await as(U.ana);
  await expectError(`insert into public.reviews (author_id, rating, comment, public_name) values ('${U.ana}', 9, 'Calificación fuera de rango de prueba.', 'Ana')`, "rating fuera de 1-5 rechazado");
  await as(U.admin);
  await db.exec(`update public.reviews set status='aprobada' where id='${revId}'`);
  await as(null);
  ok((await db.query(`select * from public.reviews`)).rows.length === 1, "anon ve reseña aprobada");

  // ── Configuración y contacto
  console.log("\nConfiguración y contacto");
  await as(null);
  await expectError(`update public.site_settings set value='573000000000' where key='whatsapp_number'; select 1/(select count(*) from public.site_settings where value='573000000000')`, "anon NO cambia WhatsApp");
  await db.exec(`insert into public.contact_messages (full_name, email, message, data_consent) values ('Visitante', 'v@x.co', 'Quisiera orientación sobre un comparendo.', true)`);
  ok(true, "anon envía mensaje de contacto");
  ok((await db.query(`select * from public.contact_messages`)).rows.length === 0, "anon NO lee mensajes de contacto");
  await as(U.ana);
  await expectError(`select public.admin_stats()`, "cliente NO accede a estadísticas");
  await as(U.admin);
  const stats = (await db.query<{ admin_stats: { requests_total: number } }>(`select public.admin_stats()`)).rows[0].admin_stats;
  ok(stats.requests_total === 1, "admin obtiene estadísticas");
  await db.exec(`update public.site_settings set value='573001112233' where key='whatsapp_number'`);
  ok((await db.query(`select 1 from public.site_settings where value='573001112233'`)).rows.length === 1, "admin configura WhatsApp");

  console.log(`\n${passes} OK, ${failures} fallos`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
