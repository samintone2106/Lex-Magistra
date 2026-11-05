import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelTitle } from "@/components/panel/Shell";
import { LawyerForm } from "@/components/admin/LawyerForm";
import type { Firm, Lawyer, Specialty } from "@/lib/types";

/** /admin/abogados/nuevo crea; /admin/abogados/<uuid> edita. */
export default async function AdminAbogado({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nuevo";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: firms }, { data: specialties }, lawyerRes, linksRes, { data: accounts }] = await Promise.all([
    supabase.from("firms").select("*").order("name"),
    supabase.from("specialties").select("*").order("sort_order"),
    isNew ? Promise.resolve({ data: null }) : supabase.from("lawyers").select("*").eq("id", id).maybeSingle(),
    isNew ? Promise.resolve({ data: [] }) : supabase.from("lawyer_specialties").select("specialty_id").eq("lawyer_id", id),
    supabase.from("profiles").select("id,full_name").eq("role", "lawyer").order("full_name"),
  ]);
  if (!isNew && !lawyerRes.data) notFound();
  const lawyer = (lawyerRes.data ?? undefined) as Lawyer | undefined;
  const selected = ((linksRes.data ?? []) as { specialty_id: string }[]).map((x) => x.specialty_id);

  return (
    <>
      <PanelTitle title={isNew ? "Nuevo abogado" : lawyer!.full_name}>
        {lawyer ? <Link href={`/abogados/${lawyer.id}`} target="_blank" className="btn btn-secondary">Ver perfil público</Link> : null}
      </PanelTitle>
      <LawyerForm lawyer={lawyer} firms={(firms ?? []) as Firm[]} specialties={(specialties ?? []) as Specialty[]} selected={selected} accounts={(accounts ?? []) as { id: string; full_name: string }[]} />
    </>
  );
}
