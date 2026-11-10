import { PageSkeleton } from "@/components/site/RouteStates";

// Vive en el grupo (lista) a propósito: así el esqueleto solo envuelve el listado. Si estuviera en
// abogados/, también envolvería /abogados/[id] y la respuesta saldría en streaming con 200 antes de
// que notFound() pudiera marcar el 404.
export default function Loading() {
  return <PageSkeleton variant="grid" />;
}
