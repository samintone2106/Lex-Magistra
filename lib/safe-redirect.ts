const BASE = "http://local.invalid";

/** Solo rutas internas. Bloquea "//x", "/\x", espacios y cualquier otro origen (open redirect). */
export function safeNext(next: string | null | undefined, fallback = "/panel"): string {
  if (!next || !next.startsWith("/") || /[\\\s]/.test(next)) return fallback;
  try {
    const u = new URL(next, BASE);
    return u.origin === BASE ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
}
