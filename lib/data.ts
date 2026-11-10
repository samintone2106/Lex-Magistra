import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "@/lib/content/settings";
import { SPECIALTIES_SEED } from "@/lib/content/specialties";
import type { Firm, LawyerWithRelations, Profile, Review, SiteSettings, Specialty } from "@/lib/types";

/** Etiqueta de caché de los datos públicos; las acciones de admin la invalidan al guardar. */
export const PUBLIC_DATA_TAG = "public-data";
/** Segundos que vive en caché un dato público antes de volver a pedirse a Supabase. */
export const PUBLIC_REVALIDATE = 300;

/** Cliente sin cookies para datos públicos: permite páginas estáticas/ISR. */
function publicClient() {
  return createAnonClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Caché entre requests (Data Cache) para lecturas públicas con el cliente anónimo.
 * La función interna lanza si Supabase falla: así un error nunca queda guardado como dato.
 */
function publicCache<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) {
  return unstable_cache(fn, [key], { tags: [PUBLIC_DATA_TAG], revalidate: PUBLIC_REVALIDATE });
}

const FALLBACK_SPECIALTIES: Specialty[] = SPECIALTIES_SEED.map((s) => ({ ...s, id: s.slug }));

const fetchSettings = publicCache(async (): Promise<{ key: string; value: string }[]> => {
  const { data, error } = await publicClient().from("site_settings").select("key,value");
  if (error || !data) throw new Error("site_settings no disponible");
  return data;
}, "site-settings");

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  const rows = await fetchSettings().catch(() => null);
  if (!rows) return DEFAULT_SETTINGS;
  const merged: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if ((SETTING_KEYS as string[]).includes(row.key) && row.value !== "") {
      merged[row.key as keyof SiteSettings] = row.value;
    }
  }
  return merged;
});

const fetchSpecialties = publicCache(async (): Promise<Specialty[]> => {
  const { data, error } = await publicClient()
    .from("specialties")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error || !data) throw new Error("specialties no disponible");
  return data as Specialty[];
}, "specialties");

export const getSpecialties = cache(async (): Promise<Specialty[]> => {
  if (!isSupabaseConfigured()) return FALLBACK_SPECIALTIES;
  const data = await fetchSpecialties().catch(() => null);
  return data?.length ? data : FALLBACK_SPECIALTIES;
});

export async function getSpecialtyBySlug(slug: string): Promise<Specialty | null> {
  const all = await getSpecialties();
  return all.find((s) => s.slug === slug) ?? null;
}

const LAWYER_SELECT =
  "*, firm:firms(id,name), specialties:lawyer_specialties(specialty:specialties(id,slug,short_name))";

type RawLawyer = Omit<LawyerWithRelations, "specialties"> & {
  specialties: { specialty: LawyerWithRelations["specialties"][number] | null }[];
};

function normalizeLawyer(raw: RawLawyer): LawyerWithRelations {
  return {
    ...raw,
    specialties: raw.specialties.map((s) => s.specialty).filter((s): s is NonNullable<typeof s> => !!s),
  };
}

const fetchLawyers = publicCache(async (): Promise<LawyerWithRelations[]> => {
  const { data, error } = await publicClient()
    .from("lawyers")
    .select(LAWYER_SELECT)
    .eq("is_active", true)
    .order("full_name");
  if (error || !data) throw new Error("lawyers no disponible");
  return (data as RawLawyer[]).map(normalizeLawyer);
}, "lawyers");

/** Lista completa en caché; el filtro por especialidad se aplica en memoria. */
const getAllLawyers = cache(async (): Promise<LawyerWithRelations[]> => {
  if (!isSupabaseConfigured()) return [];
  return fetchLawyers().catch(() => []);
});

export async function getLawyers(specialtySlug?: string): Promise<LawyerWithRelations[]> {
  const lawyers = await getAllLawyers();
  return specialtySlug ? lawyers.filter((l) => l.specialties.some((s) => s.slug === specialtySlug)) : lawyers;
}

const fetchLawyer = publicCache(async (id: string): Promise<LawyerWithRelations | null> => {
  const { data, error } = await publicClient()
    .from("lawyers")
    .select(LAWYER_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("lawyer no disponible");
  return data ? normalizeLawyer(data as RawLawyer) : null;
}, "lawyer");

/** Memoizada por request: generateMetadata y la página comparten la misma lectura. */
export const getLawyer = cache(async (id: string): Promise<LawyerWithRelations | null> => {
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  return fetchLawyer(id).catch(() => null);
});

export interface ReviewFilter {
  specialty?: string;
  lawyer?: string;
}

const fetchApprovedReviews = publicCache(async (specialty: string | null, lawyer: string | null): Promise<Review[]> => {
  let q = publicClient()
    .from("reviews")
    .select("id,lawyer_id,specialty_id,rating,comment,public_name,show_name,status,created_at,author_id")
    .eq("status", "aprobada")
    .order("created_at", { ascending: false })
    .limit(100);
  if (specialty) q = q.eq("specialty_id", specialty);
  if (lawyer) q = q.eq("lawyer_id", lawyer);
  const { data, error } = await q;
  if (error) throw new Error("reviews no disponible");
  // Nunca exponer author_id al cliente (ni guardarlo en caché).
  return (data ?? []).map((r) => ({ ...r, author_id: "" })) as Review[];
}, "approved-reviews");

export async function getApprovedReviews(filter: ReviewFilter = {}): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  return fetchApprovedReviews(filter.specialty ?? null, filter.lawyer ?? null).catch(() => []);
}

export function reviewStats(reviews: Pick<Review, "rating">[]) {
  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  return { total, average };
}

/** Usuario y perfil de la sesión actual (o null). Lee cookies: solo para rutas privadas. */
export const getSession = cache(async (): Promise<{ email: string; profile: Profile } | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  return { email: user.email ?? "", profile: profile as Profile };
});

const fetchFirms = publicCache(async (): Promise<Firm[]> => {
  const { data, error } = await publicClient().from("firms").select("*").eq("is_active", true).order("name");
  if (error) throw new Error("firms no disponible");
  return (data ?? []) as Firm[];
}, "firms");

export const getFirms = cache(async (): Promise<Firm[]> => {
  if (!isSupabaseConfigured()) return [];
  return fetchFirms().catch(() => []);
});
