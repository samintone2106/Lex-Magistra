/**
 * Cuentas de prueba para cambiar de rol rápido mientras se desarrolla.
 * Solo se activa con DEMO_SWITCHER=1, fuera de producción y contra un Supabase local.
 */
export const DEMO_ACCOUNTS = [
  { key: "admin", email: "admin@example.com", label: "Admin", home: "/admin" },
  { key: "abogado", email: "abogado@example.com", label: "Abogado", home: "/panel/asignadas" },
  { key: "cliente", email: "cliente@example.com", label: "Cliente", home: "/panel" },
] as const;

export type DemoKey = (typeof DEMO_ACCOUNTS)[number]["key"];

export function demoSwitcherEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEMO_SWITCHER === "1" &&
    !!process.env.DEMO_PASSWORD &&
    /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url.replace(/\/+$/, ""))
  );
}
