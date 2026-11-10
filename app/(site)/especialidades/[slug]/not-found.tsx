import { NotFoundBlock } from "@/components/site/NotFoundBlock";

export default function NotFound() {
  return (
    <NotFoundBlock
      title="Esta especialidad no existe"
      text="La dirección puede estar mal escrita o el área ya no aparece en el sitio. Revisa el listado completo de especialidades."
      href="/especialidades"
      cta="Ver especialidades"
    />
  );
}
