import { getSettings } from "@/lib/data";
import { PanelTitle } from "@/components/panel/Shell";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminConfiguracion() {
  const settings = await getSettings();
  return (
    <>
      <PanelTitle title="Configuración y contenido" lead="WhatsApp, identidad, contacto y redes de la firma. Todo lo que guardes aquí se refleja en el sitio público." />
      <SettingsForm settings={settings} />
    </>
  );
}
