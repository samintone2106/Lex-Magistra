"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import Image from "next/image";
import { useState } from "react";
import { saveLawyer } from "@/lib/actions/admin";
import { Field, FieldError, FormMessage, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import type { Firm, Lawyer, Specialty } from "@/lib/types";

export function LawyerForm({
  lawyer,
  firms,
  specialties,
  selected,
  accounts,
}: {
  lawyer?: Lawyer;
  firms: Firm[];
  specialties: Specialty[];
  selected: string[];
  accounts: { id: string; full_name: string }[];
}) {
  const { state, isPending, formProps } = useFormAction(saveLawyer);
  const [preview, setPreview] = useState<string | null>(lawyer?.photo_url ?? null);
  const e = state.errors ?? {};

  return (
    <form {...formProps} noValidate className="grid max-w-[860px] gap-6">
      {lawyer ? <input type="hidden" name="id" value={lawyer.id} /> : null}
      <input type="hidden" name="photo_url" value={lawyer?.photo_url ?? ""} />

      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div>
          <div className="relative aspect-[4/5] bg-navy">
            {preview ? <Image src={preview} alt="Vista previa de la foto" fill sizes="180px" className="object-cover" unoptimized /> : null}
          </div>
          <label htmlFor="f-photo" className="label mt-3">Fotografía (JPG, PNG o WEBP, máx. 3 MB)</label>
          <input
            id="f-photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-[14px] file:mr-3 file:min-h-10 file:border-0 file:bg-graphite file:px-3 file:text-ink"
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          <FieldError id="f-photo-err" error={e.photo} />
        </div>
        <div className="grid content-start gap-5">
          <Field label="Nombre completo" name="full_name" defaultValue={lawyer?.full_name} required error={e.full_name} />
          <Field label="Cargo o título" name="title" defaultValue={lawyer?.title ?? "Abogado"} required error={e.title} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Firma" name="firm_id" defaultValue={lawyer?.firm_id ?? ""} error={e.firm_id}>
              <option value="">Sin firma</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </Select>
            <Field label="Años de experiencia" name="years_experience" type="number" min={0} max={70} defaultValue={lawyer?.years_experience ?? ""} error={e.years_experience} />
          </div>
          <Select label="Cuenta de usuario vinculada (rol Abogado)" name="profile_id" defaultValue={lawyer?.profile_id ?? ""} error={e.profile_id}>
            <option value="">Sin cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.full_name || a.id.slice(0, 8)}</option>
            ))}
          </Select>
          <Field label="Tarjeta profesional (opcional)" name="professional_card" defaultValue={lawyer?.professional_card ?? ""} error={e.professional_card} />
        </div>
      </div>

      <fieldset>
        <legend className="label">Especialidades</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {specialties.map((s) => (
            <label key={s.id} className="flex min-h-11 cursor-pointer items-center gap-3 bg-graphite px-3 text-[15px]">
              <input type="checkbox" name="specialty_ids" value={s.id} defaultChecked={selected.includes(s.id)} className="h-5 w-5 accent-[var(--mist)]" />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>

      <TextArea label="Descripción profesional" name="bio" rows={4} defaultValue={lawyer?.bio} error={e.bio} />
      <TextArea label="Experiencia" name="experience" rows={4} defaultValue={lawyer?.experience} error={e.experience} />
      <TextArea label="Formación académica" name="education" rows={3} defaultValue={lawyer?.education} error={e.education} />
      <TextArea label="Servicios que ofrece (uno por línea)" name="services" rows={4} defaultValue={lawyer?.services.join("\n")} error={e.services} />
      <Field label="Disponibilidad" name="availability" defaultValue={lawyer?.availability ?? "Disponible para consultas"} error={e.availability} />

      <div className="flex flex-wrap gap-6 text-[15px]">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="accepts_consultations" defaultChecked={lawyer?.accepts_consultations ?? true} className="h-5 w-5 accent-[var(--mist)]" />
          Recibe nuevas consultas
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="is_active" defaultChecked={lawyer?.is_active ?? true} className="h-5 w-5 accent-[var(--mist)]" />
          Perfil publicado
        </label>
      </div>

      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Guardando…">{lawyer ? "Guardar cambios" : "Crear perfil"}</SubmitButton>
      </div>
    </form>
  );
}
