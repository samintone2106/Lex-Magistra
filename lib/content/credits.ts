export interface ImageCredit {
  src: string;
  title: string;
  author: string;
  license: string;
  page: string;
}

/** Fotografías de Wikimedia Commons usadas en el sitio (licencias libres; se acreditan en el pie). */
export const IMAGES = {
  capitolio: {
    src: "/img/capitolio.jpg",
    title: "El Capitolio Nacional (Bogotá, Colombia)",
    author: "Rikimedia",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/w/index.php?curid=21189534",
  },
  palacio: {
    src: "/img/palacio-justicia.jpg",
    title: "Palacio de Justicia de Colombia, Bogotá",
    author: "Bernard Gagnon",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Palacio_de_Justicia_de_Colombia,_Bogot%C3%A1.jpg",
  },
  placa: {
    src: "/img/placa-bolivar.jpg",
    title: "Placa en la Plaza de Bolívar, Bogotá",
    author: "Bernard Gagnon",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Plaque_at_the_Plaza_de_Bol%C3%ADvar,_Bogot%C3%A1.jpg",
  },
  columnas: {
    src: "/img/columnas.jpg",
    title: "Columnas corintias, capilla del Royal Naval College",
    author: "Acabashi",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Royal_Naval_College_Chapel_corinthian_columns,_Greenwich_Hospital.jpg",
  },
  escalera: {
    src: "/img/escalera.jpg",
    title: "Escalera del vestíbulo, Woodbury County Courthouse",
    author: "w_lemay",
    license: "CC BY-SA 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Lobby_Staircase,_Woodbury_County_Courthouse,_Douglas_Street_and_7th_Street,_Sioux_City,_IA_-_53711609432.jpg",
  },
  candelaria: {
    src: "/img/candelaria.jpg",
    title: "Bogotá, La Candelaria",
    author: "Steffen Schmitz",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Bogot%C3%A1,_La_Candelaria,_2023-06_CN-01.jpg",
  },
} satisfies Record<string, ImageCredit>;

/** Imagen asociada a cada especialidad (por slug). */
export const SPECIALTY_IMAGE: Record<string, ImageCredit> = {
  "derecho-de-transito": IMAGES.candelaria,
  "derecho-penal": IMAGES.palacio,
  "derecho-economico-y-financiero": IMAGES.columnas,
  "derecho-digital-y-tecnologico": IMAGES.escalera,
  "derecho-migratorio-y-visas": IMAGES.capitolio,
  "proteccion-del-buen-nombre": IMAGES.placa,
};
