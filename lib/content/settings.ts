import type { SiteSettings } from "@/lib/types";

/** Valores por defecto. Se sobrescriben con la tabla site_settings (editable en /admin/configuracion). */
export const DEFAULT_SETTINGS: SiteSettings = {
  firm_name: "Firma Jurídica",
  firm_tagline: "Abogados en Colombia",
  whatsapp_number: "",
  whatsapp_message: "Hola, quisiera orientación sobre un asunto legal.",
  contact_email: "",
  contact_phone: "",
  address: "",
  city: "Bogotá, Colombia",
  hours: "Lunes a viernes, 8:00 a. m. – 6:00 p. m.",
  instagram_url: "",
  facebook_url: "",
  linkedin_url: "",
  about_text:
    "Somos una firma multidisciplinaria que reúne abogados de distintas áreas para atender a personas y empresas con un mismo método: escuchar el caso completo, explicar el derecho en palabras claras y construir una estrategia antes de actuar. Trabajamos con confidencialidad, con honorarios acordados por escrito y sin prometer resultados que dependen de una autoridad.",
};

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[];
