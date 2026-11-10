import { getFirms, getLawyers, getSpecialties } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { RequestWizard } from "@/components/panel/RequestWizard";

export default async function NuevaSolicitudPage({ searchParams }: { searchParams: Promise<{ especialidad?: string; abogado?: string }> }) {
  const { especialidad, abogado } = await searchParams;
  const [specialties, lawyers, firms] = await Promise.all([getSpecialties(), getLawyers(), getFirms()]);
  return (
    <>
      <PanelTitle title="Nueva solicitud" lead="Cuatro pasos: el área, el abogado, una confirmación y tu caso. Lo que escribas es confidencial y solo lo lee el equipo jurídico." />
      <RequestWizard specialties={specialties} lawyers={lawyers} firms={firms} initialSpecialty={especialidad} initialLawyer={abogado} />
    </>
  );
}
