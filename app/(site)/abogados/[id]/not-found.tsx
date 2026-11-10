import { NotFoundBlock } from "@/components/site/NotFoundBlock";

export default function NotFound() {
  return (
    <NotFoundBlock
      title="Este perfil no está disponible"
      text="El abogado ya no aparece en el directorio o la dirección cambió. Puedes ver los demás perfiles por especialidad."
      href="/abogados"
      cta="Ver abogados"
    />
  );
}
