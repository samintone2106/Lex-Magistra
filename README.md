# Plataforma web — Firma de abogados

Next.js 15 (App Router) + Tailwind v4 + Supabase (Auth, Postgres con RLS, Storage) + GSAP/Lenis.

## Puesta en marcha

1. `npm install`
2. Crear un proyecto en Supabase (tu propia organización).
3. SQL Editor → ejecutar en orden:
   - `supabase/migrations/20261105000000_init.sql` (tablas, RLS, triggers, bucket de fotos)
   - `supabase/seed.sql` (6 especialidades + configuración inicial)
4. `cp .env.example .env.local` y completar URL + anon key (+ service role solo para el script de admin).
5. Supabase → Authentication → URL Configuration:
   - Site URL: tu dominio (o `http://localhost:3000`)
   - Redirect URLs: `<site>/auth/callback`
6. `npm run dev` → registrarse en `/registro` → `npm run make-admin -- tu@correo.com`
7. En `/admin/configuracion` poner el número de WhatsApp del chatbot (formato `573001234567`). Sin número, el botón flotante no aparece.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` / `npm run lint` | Tipos / lint |
| `npm run test:db` | Aplica la migración en Postgres en memoria (PGlite) y prueba 35 reglas de RLS |
| `npm run gen:seed` | Regenera `supabase/seed.sql` desde `lib/content/*` |
| `npm run make-admin -- correo` | Da rol admin a un usuario registrado |

## Roles

- **client** (por defecto): sus solicitudes, su perfil, enviar reseñas (quedan pendientes).
- **lawyer**: además ve y cambia el estado de las solicitudes asignadas a su perfil (`/panel/asignadas`). El admin vincula la cuenta al perfil en `/admin/abogados/<id>`.
- **admin**: todo `/admin`.

Protección en 3 capas: middleware, verificación en servidor (layouts y Server Actions) y RLS + triggers en la base.

## Antes de publicar

- Revisar con un abogado los textos de `lib/content/legal.ts` y `lib/content/specialties.ts`.
- Nombre definitivo, datos de contacto y redes en `/admin/configuracion`.
- Cargar abogados reales (no hay perfiles ni reseñas de ejemplo: no se inventan).
- Fotografías: Wikimedia Commons con licencias CC (créditos en el pie, `lib/content/credits.ts`).
- El rate limit de formularios es en memoria; con varias instancias conviene Redis/Upstash.
