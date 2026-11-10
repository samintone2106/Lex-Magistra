"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { updateProfile } from "@/lib/actions/panel";
import { Field, FormMessage, RequiredNote, SubmitButton } from "@/components/ui/Form";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const { state, isPending, formProps } = useFormAction(updateProfile);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <RequiredNote />
      <Field
        label="Correo electrónico"
        name="email_ro"
        value={email}
        readOnly
        disabled
        hint="Es tu usuario para ingresar. Para cambiarlo, escríbenos desde la página de contacto."
      />
      <Field
        label="Nombre completo"
        name="full_name"
        defaultValue={profile.full_name}
        autoComplete="name"
        required
        maxLength={120}
        placeholder="Ej.: María Fernanda Gómez Ríos"
        hint="Como aparece en tu documento de identidad. Lo usamos en la propuesta de servicios."
        error={e.full_name}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Celular"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
          maxLength={30}
          placeholder="300 123 4567"
          hint="Para WhatsApp o llamada. Si es de otro país, incluye el indicativo (+34…)."
          error={e.phone}
        />
        <Field
          label="Documento de identidad"
          name="document_id"
          defaultValue={profile.document_id ?? ""}
          autoComplete="off"
          maxLength={30}
          placeholder="1020304050"
          hint="Cédula de ciudadanía, de extranjería o pasaporte, sin puntos ni espacios."
          error={e.document_id}
        />
      </div>
      <Field
        label="Ciudad"
        name="city"
        defaultValue={profile.city ?? ""}
        autoComplete="address-level2"
        maxLength={80}
        placeholder="Ej.: Medellín"
        hint="Donde vives o donde ocurre el asunto. Algunas actuaciones dependen de la ciudad."
        error={e.city}
      />
      <FormMessage state={state} />
      <div className="flex justify-end border-t border-white/[0.06] pt-5">
        <SubmitButton busy={isPending} pending="Guardando…">
          Guardar cambios
        </SubmitButton>
      </div>
    </form>
  );
}
