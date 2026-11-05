const BASE = "http://local.invalid";

/** Solo rutas internas. Bloquea "//x", "/\x", espacios y cualquier otro origen (open redirect). */
export function safeNext(next: string | null | undefined, fallback = "/panel"): string {
  if (!next || !next.startsWith("/") || /[\\\s]/.test(next)) return fallback;
  try {
    const u = new URL(next, BASE);
    if (u.origin !== BASE) return fallback;
    // Validar también la salida normalizada: "/.//x" se normaliza a "//x".
    const out = u.pathname + u.search + u.hash;
    return out.startsWith("/") && !out.startsWith("//") && !out.startsWith("/\\") ? out : fallback;
  } catch {
    return fallback;
  }
}
