import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Cursor } from "@/components/motion/Cursor";
import { getSession, getSettings, getSpecialties } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, specialties, session] = await Promise.all([getSettings(), getSpecialties(), getSession()]);
  return (
    <MotionProvider>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-mist focus:p-3 focus:text-navy">
        Saltar al contenido
      </a>
      <Nav firmName={settings.firm_name} signedIn={!!session} isAdmin={session?.profile.role === "admin"} />
      <main id="contenido">{children}</main>
      <Footer settings={settings} specialties={specialties} />
      <WhatsAppFab number={settings.whatsapp_number} message={settings.whatsapp_message} />
      <Cursor />
    </MotionProvider>
  );
}
