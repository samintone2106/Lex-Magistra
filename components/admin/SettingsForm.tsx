"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { useState } from "react";
import { saveSettings } from "@/lib/actions/admin";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/ui/Form";
import { FormSection } from "@/components/ui/FormSection";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { state, isPending, formProps } = useFormAction(saveSettings);
  const e = state.errors ?? {};
  const [wa, setWa] = useState(settings.whatsapp_number);
  const [waMsg, setWaMsg] = useState(settings.whatsapp_message);
  const digits = wa.replace(/\D/g, "");
  const link = digits ? `https://wa.me/${digits}${waMsg ? `?text=${encodeURIComponent(waMsg)}` : ""}` : "";

  return (
    <form {...formProps} noValidate className="grid max-w-[1080px] gap-8">
      <FormSection title="WhatsApp" description="El botón flotante del sitio y los enlaces «Escribir por WhatsApp» de los paneles abren este chat.">
        <Field
          label="Número de WhatsApp"
          name="whatsapp_number"
          value={wa}
          onChange={(ev) => setWa(ev.target.value)}
          inputMode="numeric"
          autoComplete="off"
          maxLength={20}
          placeholder="573001234567"
          hint="Formato internacional, sin «+» ni espacios: 57 (Colombia) seguido del celular. Déjalo vacío para ocultar el botón."
          error={e.whatsapp_number}
        />
        <Field
          label="Mensaje inicial sugerido"
          name="whatsapp_message"
          value={waMsg}
          onChange={(ev) => setWaMsg(ev.target.value)}
          maxLength={300}
          placeholder="Hola, quisiera orientación sobre un asunto legal."
          hint="Texto que aparece ya escrito cuando el visitante abre el chat. Puede editarlo antes de enviar."
          error={e.whatsapp_message}
        />
        <div className="bg-navy p-4" aria-live="polite">
          <p className="text-[13px] text-ink-soft">Así abrirá el chat</p>
          {link ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-[14px]">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-wa" />
                <span className="truncate">+{digits}</span>
                {waMsg ? <span className="truncate text-ink-soft">· «{waMsg}»</span> : null}
              </p>
              <a href={link} target="_blank" rel="noopener noreferrer" className="link text-[14px]">
                Probar el enlace <span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            </div>
          ) : (
            <p className="mt-2 text-[14px]">Sin número: el botón flotante no se mostrará.</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Identidad" description="Nombre y textos que aparecen en el encabezado, el pie, la pestaña del navegador y la página Nosotros.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Nombre de la firma"
            name="firm_name"
            defaultValue={settings.firm_name}
            required
            maxLength={120}
            autoComplete="organization"
            placeholder="Ej.: Restrepo & Asociados"
            hint="Se muestra junto al monograma."
            error={e.firm_name}
          />
          <Field
            label="Lema corto"
            name="firm_tagline"
            defaultValue={settings.firm_tagline}
            maxLength={80}
            placeholder="Ej.: Abogados en Colombia"
            hint="Acompaña el nombre en el título de la pestaña y en buscadores."
            error={e.firm_tagline}
          />
        </div>
        <TextArea
          label="Texto de presentación"
          name="about_text"
          rows={5}
          maxLength={4000}
          defaultValue={settings.about_text}
          hint="Párrafo de la sección «Nosotros» y del inicio. Habla del método de trabajo, sin prometer resultados."
          error={e.about_text}
        />
      </FormSection>

      <FormSection title="Contacto" description="Datos del pie de página y de la página de contacto. Los vacíos no se muestran.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Correo"
            name="contact_email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={settings.contact_email}
            placeholder="contacto@firma.com.co"
            hint="Recibe las consultas de quienes prefieren escribir."
            error={e.contact_email}
          />
          <Field
            label="Teléfono"
            name="contact_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={settings.contact_phone}
            placeholder="+57 601 123 4567"
            hint="Fijo o celular, con indicativo."
            error={e.contact_phone}
          />
          <Field
            label="Dirección"
            name="address"
            autoComplete="street-address"
            defaultValue={settings.address}
            placeholder="Ej.: Carrera 7 # 12-45, oficina 501"
            hint="Dirección de atención presencial."
            error={e.address}
          />
          <Field
            label="Ciudad"
            name="city"
            autoComplete="address-level2"
            defaultValue={settings.city}
            placeholder="Bogotá, Colombia"
            hint="Ciudad y país."
            error={e.city}
          />
        </div>
        <Field
          label="Horario de atención"
          name="hours"
          defaultValue={settings.hours}
          placeholder="Lunes a viernes, 8:00 a. m. – 6:00 p. m."
          hint="Escríbelo como quieres que se lea."
          error={e.hours}
        />
      </FormSection>

      <FormSection title="Redes sociales" description="Enlaces del pie de página. Deja vacías las que no uses.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Instagram" name="instagram_url" type="url" inputMode="url" placeholder="https://instagram.com/…" defaultValue={settings.instagram_url} hint="Dirección completa del perfil." error={e.instagram_url} />
          <Field label="Facebook" name="facebook_url" type="url" inputMode="url" placeholder="https://facebook.com/…" defaultValue={settings.facebook_url} hint="Dirección completa de la página." error={e.facebook_url} />
          <Field label="LinkedIn" name="linkedin_url" type="url" inputMode="url" placeholder="https://linkedin.com/company/…" defaultValue={settings.linkedin_url} hint="Perfil de la firma." error={e.linkedin_url} />
        </div>
      </FormSection>

      <FormMessage state={state} />
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-4 border-t border-white/[0.07] bg-carbon px-4 py-4 sm:mx-0 sm:px-0">
        <SubmitButton busy={isPending} pending="Guardando…">
          Guardar configuración
        </SubmitButton>
      </div>
    </form>
  );
}
