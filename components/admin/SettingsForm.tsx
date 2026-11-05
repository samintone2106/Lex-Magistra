"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { saveSettings } from "@/lib/actions/admin";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/ui/Form";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { state, isPending, formProps } = useFormAction(saveSettings);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid max-w-[860px] gap-10">
      <fieldset className="grid gap-5">
        <legend className="mb-4 text-[18px] font-semibold">WhatsApp</legend>
        <Field
          label="Número de WhatsApp del chatbot"
          name="whatsapp_number"
          defaultValue={settings.whatsapp_number}
          inputMode="numeric"
          placeholder="573001234567"
          hint="Formato internacional sin + ni espacios. Se usa como https://wa.me/NUMERO. Vacío = el botón flotante no se muestra."
          error={e.whatsapp_number}
        />
        <Field label="Mensaje inicial sugerido" name="whatsapp_message" defaultValue={settings.whatsapp_message} error={e.whatsapp_message} />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-4 text-[18px] font-semibold">Identidad</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre de la firma" name="firm_name" defaultValue={settings.firm_name} required error={e.firm_name} />
          <Field label="Lema corto (título del sitio)" name="firm_tagline" defaultValue={settings.firm_tagline} error={e.firm_tagline} />
        </div>
        <TextArea label="Texto de presentación (inicio y Nosotros)" name="about_text" rows={5} defaultValue={settings.about_text} error={e.about_text} />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-4 text-[18px] font-semibold">Contacto</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Correo" name="contact_email" type="email" defaultValue={settings.contact_email} error={e.contact_email} />
          <Field label="Teléfono" name="contact_phone" defaultValue={settings.contact_phone} error={e.contact_phone} />
          <Field label="Dirección" name="address" defaultValue={settings.address} error={e.address} />
          <Field label="Ciudad" name="city" defaultValue={settings.city} error={e.city} />
        </div>
        <Field label="Horario" name="hours" defaultValue={settings.hours} error={e.hours} />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-4 text-[18px] font-semibold">Redes sociales</legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Instagram" name="instagram_url" type="url" placeholder="https://" defaultValue={settings.instagram_url} error={e.instagram_url} />
          <Field label="Facebook" name="facebook_url" type="url" placeholder="https://" defaultValue={settings.facebook_url} error={e.facebook_url} />
          <Field label="LinkedIn" name="linkedin_url" type="url" placeholder="https://" defaultValue={settings.linkedin_url} error={e.linkedin_url} />
        </div>
      </fieldset>

      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Guardando…">Guardar configuración</SubmitButton>
      </div>
    </form>
  );
}
