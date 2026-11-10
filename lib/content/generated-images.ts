/**
 * Imágenes propias del sitio (no provienen de Wikimedia Commons, por eso no van en los créditos del pie).
 * Todas se muestran con la clase `duotone`.
 */
export interface SiteImage {
  src: string;
  title: string;
}

export const OWN_IMAGES = {
  expediente: { src: "/img/expediente.jpg", title: "Carpetas de expedientes sobre un escritorio" },
  candelariaLluvia: { src: "/img/candelaria-lluvia.jpg", title: "La Candelaria, Bogotá, al amanecer después de la lluvia" },
  biblioteca: { src: "/img/biblioteca.jpg", title: "Libros antiguos de derecho" },
  firma: { src: "/img/firma.jpg", title: "Una mano firma un documento" },
} satisfies Record<string, SiteImage>;
