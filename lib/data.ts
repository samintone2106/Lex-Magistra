import "server-only";
import { cache } from "react";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "@/lib/content/settings";
import { SPECIALTIES_SEED } from "@/lib/content/specialties";
import type { Firm, LawyerWithRelations, Profile, Review, SiteSettings, Specialty } from "@/lib/types";

/** Cliente sin cookies para datos públicos: permite páginas estáticas/ISR. */
function publicClient() {
  return createAnonClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const FALLBACK_SPECIALTIES: Specialty[] = SPECIALTIES_SEED.map((s) => ({ ...s, id: s.slug }));

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  const { data, error } = await publicClient().from("site_settings").select("key,value");
  if (error || !data) return DEFAULT_SETTINGS;
  const merged: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const row of data) {
    if ((SETTING_KEYS as string[]).includes(row.key) && row.value !== "") {
      merged[row.key as keyof SiteSettings] = row.value;
    }
  }
  return merged;
});

export const getSpecialties = cache(async (): Promise<Specialty[]> => {
  if (!isSupabaseConfigured()) return FALLBACK_SPECIALTIES;
  const { data, error } = await publicClient()
    .from("specialties")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error || !data?.length) return FALLBACK_SPECIALTIES;
  return data as Specialty[];
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

export const getLawyers = cache(async (specialtySlug?: string): Promise<LawyerWithRelations[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await publicClient()
    .from("lawyers")
    .select(LAWYER_SELECT)
    .eq("is_active", true)
    .order("full_name");
  if (error || !data) return [];
  const lawyers = (data as RawLawyer[]).map(normalizeLawyer);
  return specialtySlug ? lawyers.filter((l) => l.specialties.some((s) => s.slug === specialtySlug)) : lawyers;
});

export async function getLawyer(id: string): Promise<LawyerWithRelations | null> {
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await publicClient()
    .from("lawyers")
    .select(LAWYER_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  return data ? normalizeLawyer(data as RawLawyer) : null;
}

export interface ReviewFilter {
  specialty?: string;
  lawyer?: string;
}

export async function getApprovedReviews(filter: ReviewFilter = {}): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  let q = publicClient()
    .from("reviews")
    .select("id,lawyer_id,specialty_id,rating,comment,public_name,show_name,status,created_at,author_id")
    .eq("status", "aprobada")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filter.specialty) q = q.eq("specialty_id", filter.specialty);
  if (filter.lawyer) q = q.eq("lawyer_id", filter.lawyer);
  const { data } = await q;
  // Nunca exponer author_id al cliente.
  return (data ?? []).map((r) => ({ ...r, author_id: "" })) as Review[];
}

export function reviewStats(reviews: Pick<Review, "rating">[]) {
  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  return { total, average };
}

/** Usuario y perfil de la sesión actual (o null). */
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

export const getFirms = cache(async (): Promise<Firm[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data } = await publicClient().from("firms").select("*").eq("is_active", true).order("name");
  return (data ?? []) as Firm[];
});
