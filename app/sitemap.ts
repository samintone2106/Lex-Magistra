import type { MetadataRoute } from "next";
import { getLawyers, getSpecialties } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [specialties, lawyers] = await Promise.all([getSpecialties(), getLawyers()]);
  const fixed = ["", "/especialidades", "/abogados", "/nosotros", "/opiniones", "/contacto", "/legal/tratamiento-datos", "/legal/privacidad", "/legal/terminos"];
  return [
    ...fixed.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...specialties.map((s) => ({ url: `${BASE}/especialidades/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...lawyers.map((l) => ({ url: `${BASE}/abogados/${l.id}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
