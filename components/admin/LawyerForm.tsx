"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { saveLawyer } from "@/lib/actions/admin";
import { Checkbox, Field, FormMessage, Hint, RequiredNote, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import { ImageDrop } from "@/components/ui/ImageDrop";
import { LAWYER_PHOTO_MAX } from "@/lib/validation";
import { isOwnPublicUrl } from "@/lib/storage-url";
import { FormSection } from "@/components/ui/FormSection";
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
  const e = state.errors ?? {};

  return (
    <form {...formProps} noValidate className="grid max-w-[1080px] gap-8">
      {lawyer ? <input type="hidden" name="id" value={lawyer.id} /> : null}
      <input type="hidden" name="photo_url" value={lawyer?.photo_url ?? ""} />
      <RequiredNote />

      <FormSection title="Identidad" description="Lo primero que ve el cliente en la tarjeta y en el perfil público.">
        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <ImageDrop
            id="f-photo"
            label="Fotografía"
            name="photo"
            aspect={0.8}
            width={160}
            layout="stack"
            grayscale
            maxBytes={LAWYER_PHOTO_MAX}
            currentUrl={isOwnPublicUrl(lawyer?.photo_url, "lawyer-photos") ? lawyer?.photo_url : null}
            fallback="Sin foto: se mostrarán sus iniciales"
            error={e.photo}
            hint="JPG, PNG o WEBP. Se recorta en retrato 4:5 y se guarda optimizada."
          />
          <div className="grid content-start gap-5">
            <Field
              label="Nombre completo"
              name="full_name"
              defaultValue={lawyer?.full_name}
              required
              maxLength={120}
              autoComplete="off"
              placeholder="Ej.: Laura Restrepo Cárdenas"
              hint="Como figura en su tarjeta profesional."
              error={e.full_name}
            />
            <Field
              label="Cargo o título"
              name="title"
              defaultValue={lawyer?.title ?? "Abogado"}
              required
              maxLength={120}
              placeholder="Ej.: Abogada penalista, socia"
              hint="Aparece bajo el nombre en las tarjetas."
              error={e.title}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Tarjeta profesional"
                name="professional_card"
                defaultValue={lawyer?.professional_card ?? ""}
                maxLength={40}
                placeholder="Ej.: 245.678 del C. S. de la J."
                hint="Opcional. Número de la tarjeta del Consejo Superior de la Judicatura."
                error={e.professional_card}
              />
              <Field
                label="Años de experiencia"
                name="years_experience"
                type="number"
                inputMode="numeric"
                min={0}
                max={70}
                defaultValue={lawyer?.years_experience ?? ""}
                placeholder="Ej.: 12"
                hint="Opcional. Número entero entre 0 y 70."
                error={e.years_experience}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Firma y cuenta" description="A qué firma pertenece y con qué cuenta ve las solicitudes que se le asignan.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Firma" name="firm_id" defaultValue={lawyer?.firm_id ?? ""} error={e.firm_id} hint="Las firmas se registran en la sección Firmas.">
            <option value="">Sin firma</option>
            {firms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
          <Select
            label="Cuenta vinculada"
            name="profile_id"
            defaultValue={lawyer?.profile_id ?? ""}
            error={e.profile_id}
            hint={accounts.length ? "Solo aparecen usuarios con rol Abogado. Así verá sus casos asignados." : "No hay usuarios con rol Abogado. Cámbialo en Usuarios y roles."}
          >
            <option value="">Sin cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name || `Usuario ${a.id.slice(0, 8)}`}
              </option>
            ))}
          </Select>
        </div>
      </FormSection>

      <FormSection title="Especialidades" description="Define en qué solicitudes puede ser elegido o asignado. Marca al menos una.">
        <fieldset aria-describedby="f-specs-hint">
          <legend className="sr-only">Especialidades que atiende</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {specialties.map((s) => (
              <label
                key={s.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 bg-graphite px-3 text-[15px] transition-colors hover:bg-navy/70 has-[:checked]:bg-navy"
              >
                <input type="checkbox" name="specialty_ids" value={s.id} defaultChecked={selected.includes(s.id)} className="h-5 w-5 accent-[var(--mist)]" />
                {s.name}
              </label>
            ))}
          </div>
          <Hint id="f-specs-hint">Un abogado sin especialidades no aparece en el asistente de nueva solicitud.</Hint>
        </fieldset>
      </FormSection>

      <FormSection title="Perfil público" description="Textos de la página del abogado. Escribe en segunda o tercera persona, sin prometer resultados.">
        <TextArea
          label="Descripción profesional"
          name="bio"
          rows={4}
          maxLength={4000}
          defaultValue={lawyer?.bio}
          placeholder="Ej.: Acompaña a personas y empresas en procesos penales desde la denuncia hasta el juicio…"
          hint="Dos o tres frases. Se muestran en la tarjeta (recortadas) y completas en el perfil."
          error={e.bio}
        />
        <TextArea
          label="Experiencia"
          name="experience"
          rows={4}
          maxLength={4000}
          defaultValue={lawyer?.experience}
          placeholder="Ej.: 10 años en litigio penal; exfuncionaria de la Fiscalía…"
          hint="Cargos, tipos de casos y trayectoria relevante."
          error={e.experience}
        />
        <TextArea
          label="Formación académica"
          name="education"
          rows={3}
          maxLength={4000}
          defaultValue={lawyer?.education}
          placeholder="Ej.: Abogada, Universidad de Antioquia. Especialista en Derecho Penal, Universidad Externado."
          hint="Títulos e instituciones, en el orden que quieras mostrarlos."
          error={e.education}
        />
        <TextArea
          label="Servicios que ofrece"
          name="services"
          rows={4}
          maxLength={4000}
          defaultValue={lawyer?.services.join("\n")}
          placeholder={"Defensa en audiencias\nRepresentación de víctimas\nConceptos jurídicos"}
          hint="Uno por línea. Cada línea se muestra como un punto de la lista."
          error={e.services}
        />
      </FormSection>

      <FormSection title="Disponibilidad y publicación" description="Controla si el perfil se ve en el sitio y si los clientes pueden elegirlo.">
        <Field
          label="Texto de disponibilidad"
          name="availability"
          maxLength={200}
          defaultValue={lawyer?.availability ?? "Disponible para consultas"}
          placeholder="Ej.: Atiende de lunes a jueves, virtual o presencial"
          hint="Se muestra bajo el nombre cuando recibe consultas."
          error={e.availability}
        />
        <div className="grid gap-4">
          <Checkbox
            name="accepts_consultations"
            id="f-accepts"
            defaultChecked={lawyer?.accepts_consultations ?? true}
            hint="Si la desmarcas, el perfil sigue visible pero no se puede elegir al crear una solicitud."
          >
            Recibe nuevas consultas
          </Checkbox>
          <Checkbox name="is_active" id="f-active" defaultChecked={lawyer?.is_active ?? true} hint="Si la desmarcas, el perfil queda oculto del sitio y del asistente.">
            Perfil publicado
          </Checkbox>
        </div>
      </FormSection>

      <FormMessage state={state} />
      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-3 border-t border-white/[0.07] bg-carbon px-4 py-4 sm:mx-0 sm:px-0">
        <SubmitButton busy={isPending} pending="Guardando…">
          {lawyer ? "Guardar cambios" : "Crear perfil"}
        </SubmitButton>
      </div>
    </form>
  );
}
