import { getSettings } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminConfiguracion() {
  const settings = await getSettings();
  return (
    <>
      <PanelTitle title="Configuración y contenido" lead="Datos de la firma, WhatsApp, contacto y textos que se muestran en el sitio." />
      <SettingsForm settings={settings} />
    </>
  );
}
