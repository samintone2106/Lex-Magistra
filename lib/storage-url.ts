/** URLs de Storage del propio proyecto (se usa en servidor y en cliente). */

const BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");

/** Prefijo de los archivos públicos de un bucket. */
export const publicPrefix = (bucket: string) => `${BASE}/storage/v1/object/public/${bucket}/`;

/** Solo acepta URLs públicas de nuestro Storage: evita pintar imágenes de terceros guardadas en la base. */
export function isOwnPublicUrl(url: string | null | undefined, bucket: string): url is string {
  return !!url && !!BASE && url.startsWith(publicPrefix(bucket)) && !url.includes("..");
}

/** Ruta dentro del bucket a partir de su URL pública (o null si no es nuestra). */
export function pathFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!isOwnPublicUrl(url, bucket)) return null;
  const path = decodeURIComponent(url.slice(publicPrefix(bucket).length).split("?")[0]);
  return path || null;
}
