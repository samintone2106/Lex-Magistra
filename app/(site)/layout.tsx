import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Cursor } from "@/components/motion/Cursor";
import { getSettings, getSpecialties } from "@/lib/data";

// Sin cookies aquí: las páginas públicas se prerenderizan y se regeneran (ISR) cada 5 min
// o al guardar en el admin (revalidatePath/revalidateTag). La sesión del menú va en el cliente.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, specialties] = await Promise.all([getSettings(), getSpecialties()]);
  return (
    <MotionProvider>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-mist focus:p-3 focus:text-navy">
        Saltar al contenido
      </a>
      <Nav firmName={settings.firm_name} />
      <main id="contenido">{children}</main>
      <Footer settings={settings} specialties={specialties} />
      <WhatsAppFab number={settings.whatsapp_number} message={settings.whatsapp_message} />
      <Cursor />
    </MotionProvider>
  );
}
