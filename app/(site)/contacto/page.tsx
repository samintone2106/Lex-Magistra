import type { Metadata } from "next";
import { getSettings, getSpecialties } from "@/lib/data";
import { ContactSection } from "@/components/landing/Sections";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos o habla con un asesor por WhatsApp para recibir orientación inicial.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactoPage() {
  const [settings, specialties] = await Promise.all([getSettings(), getSpecialties()]);
  return (
    <div className="pt-24">
      <ContactSection settings={settings} specialties={specialties} waHref={whatsappUrl(settings.whatsapp_number, settings.whatsapp_message)} asPage />
    </div>
  );
}
