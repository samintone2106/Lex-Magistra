export type UserRole = "client" | "lawyer" | "admin";
export type RequestStatus = "pendiente" | "en_revision" | "contactado" | "cerrado" | "rechazado";
export type ReviewStatus = "pendiente" | "aprobada" | "rechazada";

export interface Faq {
  q: string;
  a: string;
}

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  icon: string;
  summary: string;
  description: string;
  problems: string[];
  services: string[];
  faqs: Faq[];
  sort_order: number;
  is_active: boolean;
}

export interface Firm {
  id: string;
  name: string;
  description: string;
  city: string | null;
  website: string | null;
  is_active: boolean;
}

export interface Lawyer {
  id: string;
  profile_id: string | null;
  firm_id: string | null;
  full_name: string;
  title: string;
  photo_url: string | null;
  bio: string;
  experience: string;
  education: string;
  services: string[];
  years_experience: number | null;
  professional_card: string | null;
  availability: string;
  accepts_consultations: boolean;
  is_active: boolean;
}

export interface LawyerWithRelations extends Lawyer {
  firm: Pick<Firm, "id" | "name"> | null;
  specialties: Pick<Specialty, "id" | "slug" | "short_name">[];
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  document_id: string | null;
  city: string | null;
  role: UserRole;
  avatar_url: string | null;
  data_consent_at: string | null;
  created_at: string;
}

export interface ConsultationRequest {
  id: string;
  client_id: string;
  specialty_id: string;
  lawyer_id: string | null;
  firm_id: string | null;
  subject: string;
  description: string;
  preferred_contact: "whatsapp" | "llamada" | "correo";
  data_consent: boolean;
  data_consent_at: string;
  status: RequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  uploaded_by: string;
  path: string;
  name: string;
  mime: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  size: number;
  created_at: string;
}

/** Adjunto listo para mostrar: miniatura firmada (solo imágenes) y si quien mira puede quitarlo. */
export interface AttachmentView extends RequestAttachment {
  thumbUrl: string | null;
}

export interface Review {
  id: string;
  author_id: string;
  lawyer_id: string | null;
  specialty_id: string | null;
  rating: number;
  comment: string;
  public_name: string;
  show_name: boolean;
  status: ReviewStatus;
  created_at: string;
}

export interface SiteSettings {
  firm_name: string;
  firm_tagline: string;
  whatsapp_number: string;
  whatsapp_message: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  hours: string;
  instagram_url: string;
  facebook_url: string;
  linkedin_url: string;
  about_text: string;
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  contactado: "Contactado",
  cerrado: "Cerrado",
  rechazado: "No procede",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  client: "Cliente",
  lawyer: "Abogado",
  admin: "Administrador",
};
