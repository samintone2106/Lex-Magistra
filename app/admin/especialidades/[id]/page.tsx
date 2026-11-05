import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelTitle } from "@/components/panel/Shell";
import { SpecialtyForm } from "@/components/admin/SpecialtyForm";
import type { Specialty } from "@/lib/types";

/** /admin/especialidades/nueva crea; /admin/especialidades/<uuid> edita. */
export default async function AdminEspecialidad({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "nueva") {
    return (
      <>
        <PanelTitle title="Nueva especialidad" />
        <SpecialtyForm />
      </>
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("specialties").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const s = data as Specialty;
  return (
    <>
      <PanelTitle title={s.name}>
        <Link href={`/especialidades/${s.slug}`} target="_blank" className="btn btn-secondary">Ver página</Link>
      </PanelTitle>
      <SpecialtyForm specialty={s} />
    </>
  );
}
