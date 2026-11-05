"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { saveSpecialty } from "@/lib/actions/admin";
import { Field, FormMessage, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import { ICON_NAMES } from "@/components/site/SpecialtyIcon";
import type { Specialty } from "@/lib/types";

export function SpecialtyForm({ specialty }: { specialty?: Specialty }) {
  const { state, isPending, formProps } = useFormAction(saveSpecialty);
  const e = state.errors ?? {};
  const faqs = specialty?.faqs.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n\n") ?? "";
  return (
    <form {...formProps} noValidate className="grid max-w-[860px] gap-5">
      {specialty ? <input type="hidden" name="id" value={specialty.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" name="name" defaultValue={specialty?.name} required error={e.name} />
        <Field label="Nombre corto" name="short_name" defaultValue={specialty?.short_name} required error={e.short_name} />
        <Field label="URL (slug)" name="slug" defaultValue={specialty?.slug} required error={e.slug} hint="Ej.: derecho-laboral. Cambiarla rompe los enlaces existentes." />
        <Select label="Icono" name="icon" defaultValue={specialty?.icon ?? "scale"} error={e.icon}>
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Select>
        <Field label="Orden" name="sort_order" type="number" min={0} defaultValue={specialty?.sort_order ?? 10} error={e.sort_order} />
      </div>
      <TextArea label="Resumen (tarjeta)" name="summary" rows={2} defaultValue={specialty?.summary} error={e.summary} />
      <TextArea label="Descripción detallada" name="description" rows={6} defaultValue={specialty?.description} error={e.description} />
      <TextArea label="Problemas que resuelve (uno por línea)" name="problems" rows={5} defaultValue={specialty?.problems.join("\n")} error={e.problems} />
      <TextArea label="Servicios (uno por línea)" name="services" rows={5} defaultValue={specialty?.services.join("\n")} error={e.services} />
      <TextArea label="Preguntas frecuentes (formato «P: …» y «R: …», separadas por una línea en blanco)" name="faqs" rows={8} defaultValue={faqs} error={e.faqs} />
      <label className="flex items-center gap-3 text-[15px]">
        <input type="checkbox" name="is_active" defaultChecked={specialty?.is_active ?? true} className="h-5 w-5 accent-[var(--mist)]" /> Publicada
      </label>
      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Guardando…">{specialty ? "Guardar cambios" : "Crear especialidad"}</SubmitButton>
      </div>
    </form>
  );
}
