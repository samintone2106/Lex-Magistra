"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { saveSpecialty } from "@/lib/actions/admin";
import { Checkbox, Field, FormMessage, RequiredNote, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import { FormSection } from "@/components/ui/FormSection";
import { ICON_NAMES } from "@/components/site/SpecialtyIcon";
import type { Specialty } from "@/lib/types";

const ICON_LABEL: Record<string, string> = {
  scale: "Balanza",
  car: "Vehículo",
  gavel: "Mazo",
  landmark: "Edificio institucional",
  shield: "Escudo",
  plane: "Avión",
  "badge-check": "Insignia verificada",
};

export function SpecialtyForm({ specialty }: { specialty?: Specialty }) {
  const { state, isPending, formProps } = useFormAction(saveSpecialty);
  const e = state.errors ?? {};
  const faqs = specialty?.faqs.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n\n") ?? "";
  return (
    <form {...formProps} noValidate className="grid max-w-[1080px] gap-8">
      {specialty ? <input type="hidden" name="id" value={specialty.id} /> : null}
      <RequiredNote />

      <FormSection title="Nombre y dirección" description="Cómo se llama el área en el menú, en las tarjetas y en la dirección de su página.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Nombre"
            name="name"
            defaultValue={specialty?.name}
            required
            maxLength={120}
            placeholder="Ej.: Derecho de tránsito"
            hint="Título completo de la página."
            error={e.name}
          />
          <Field
            label="Nombre corto"
            name="short_name"
            defaultValue={specialty?.short_name}
            required
            maxLength={60}
            placeholder="Ej.: Tránsito"
            hint="Para filtros y etiquetas donde hay poco espacio."
            error={e.short_name}
          />
          <Field
            label="Dirección (slug)"
            name="slug"
            defaultValue={specialty?.slug}
            required
            maxLength={60}
            pattern="[a-z0-9-]{2,60}"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="derecho-de-transito"
            hint="Solo minúsculas, números y guiones. Cambiarla rompe los enlaces que ya existan."
            error={e.slug}
          />
          <div className="grid grid-cols-2 gap-5">
            <Select label="Icono" name="icon" defaultValue={specialty?.icon ?? "scale"} error={e.icon} hint="Acompaña el nombre en las listas.">
              {ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {ICON_LABEL[n] ?? n}
                </option>
              ))}
            </Select>
            <Field
              label="Orden"
              name="sort_order"
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              required
              defaultValue={specialty?.sort_order ?? 10}
              hint="Menor aparece primero (0 a 999)."
              error={e.sort_order}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Textos de la página" description="Lo que lee quien llega buscando ayuda. Lenguaje claro, sin tecnicismos ni promesas de resultado.">
        <TextArea
          label="Resumen"
          name="summary"
          rows={2}
          maxLength={400}
          defaultValue={specialty?.summary}
          placeholder="Ej.: Fotomultas, comparendos, accidentes y licencias."
          hint="Una frase para la tarjeta del área en el inicio y en el asistente."
          error={e.summary}
        />
        <TextArea
          label="Descripción detallada"
          name="description"
          rows={6}
          maxLength={6000}
          defaultValue={specialty?.description}
          hint="Dos o tres párrafos. Separa los párrafos con una línea en blanco."
          error={e.description}
        />
        <TextArea
          label="Problemas que resuelve"
          name="problems"
          rows={5}
          maxLength={6000}
          defaultValue={specialty?.problems.join("\n")}
          placeholder={"Me llegó una fotomulta que no reconozco\nMe suspendieron la licencia"}
          hint="Uno por línea, escrito como lo diría el cliente."
          error={e.problems}
        />
        <TextArea
          label="Servicios"
          name="services"
          rows={5}
          maxLength={6000}
          defaultValue={specialty?.services.join("\n")}
          placeholder={"Impugnación de comparendos\nRepresentación en audiencias"}
          hint="Uno por línea."
          error={e.services}
        />
        <TextArea
          label="Preguntas frecuentes"
          name="faqs"
          rows={8}
          maxLength={12000}
          defaultValue={faqs}
          placeholder={"P: ¿Cuánto tiempo tengo para impugnar?\nR: Depende de la notificación…\n\nP: ¿Necesito ir a la audiencia?\nR: …"}
          hint="Empieza la pregunta con «P:» y la respuesta con «R:». Deja una línea en blanco entre cada pareja."
          error={e.faqs}
        />
      </FormSection>

      <FormSection title="Publicación" description="Una especialidad oculta no aparece en el sitio ni en el asistente de nueva solicitud.">
        <Checkbox name="is_active" id="f-spec-active" defaultChecked={specialty?.is_active ?? true}>
          Publicada
        </Checkbox>
      </FormSection>

      <FormMessage state={state} />
      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-white/[0.07] bg-carbon px-4 py-4 sm:mx-0 sm:px-0">
        <SubmitButton busy={isPending} pending="Guardando…">
          {specialty ? "Guardar cambios" : "Crear especialidad"}
        </SubmitButton>
      </div>
    </form>
  );
}
