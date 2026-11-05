# blueprint — Plataforma firma de abogados

## Objetivo
Plataforma real (no landing estática) para firma multidisciplinaria en Colombia: landing premium con animaciones notorias, 6 especialidades con ruta propia, auth, panel cliente (especialidad → abogado → solicitud), reseñas moderadas, admin con roles, WhatsApp configurable, páginas legales.

## Punto actual (2026-11-05)
Código completo y verificado en local SIN base conectada (sitio público funciona con contenido de respaldo). Falta conectar un proyecto Supabase propio del usuario (la única org disponible era "Kreoon" → descartado por decisión del usuario).

## Stack
Next.js 15.5 App Router · Tailwind v4 · @supabase/ssr · GSAP 3 (ScrollTrigger, SplitText) + Lenis · zod · PGlite (tests RLS).

## Archivos clave
- `supabase/migrations/20261105000000_init.sql` — esquema, RLS, triggers (rol, estado, historial, moderación), admin_stats, bucket.
- `supabase/seed.sql` — generado por `scripts/gen-seed.ts`.
- `scripts/test-db.ts` — 35 pruebas RLS en PGlite.
- `lib/data.ts` (lecturas), `lib/actions/{public,auth,panel,admin}.ts` (escrituras), `lib/validation.ts`.
- `components/motion/*` — Lenis, SplitHeading, Magnetic, Cursor. `components/landing/*` — Hero fijo con fotos, Marquee, SpecialtiesRail (pin horizontal), Orientador, Process.
- `middleware.ts` — sesión + protección /panel y /admin.

## Dirección visual
design-taste-frontend, dirección "name-as-monument" (seed 1923193669) con paleta y tipos de la marca: Instrument Serif + Geist, fondo carbón, campos navy, acento mist. Fotos duotono navy de arquitectura judicial colombiana (Wikimedia, CC).

## Verificación hecha
- `tsc --noEmit` ✓ · `eslint` ✓ · `next build` ✓ · `test:db` 35/35 ✓
- 20 rutas responden (privadas → 307 a login), 31 enlaces internos sin 404.
- Inspector de diseño: quedan 2 FAIL defendibles en home (preloader intencional solo 1ª visita por sesión; tarjetas que salen de pantalla en el pin horizontal).
- Formularios: validación + errores accesibles + no pierden lo escrito (Playwright).

## Intentos fallidos
- [2026-11-05] clases CSS propias sin @layer → pisaban utilidades Tailwind (foto hero con altura 0, botón Menú visible en desktop) → movidas a `@layer components`.
- [2026-11-05] `<form action>` de React 19 resetea campos tras error → hook `useFormAction` con onSubmit + startTransition.
- [2026-11-05] Playwright MCP pedía chromium-1247 → junction a chromium-1248.

## Siguientes pasos
1. Crear proyecto Supabase propio, correr migración + seed, configurar redirect URLs, `.env.local`.
2. E2E con BD real: registro → confirmación correo → wizard → admin cambia estado → reseña aprobada.
3. `/code-review`, `/security-review`, capturas 390/1280 de panel y admin con datos.
4. Deploy con `all-deploy` (preview primero).
