"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { updateProfile } from "@/lib/actions/panel";
import { Field, FormMessage, SubmitButton } from "@/components/ui/Form";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const { state, isPending, formProps } = useFormAction(updateProfile);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid max-w-[640px] gap-5">
      <Field label="Correo electrónico" name="email_ro" value={email} readOnly disabled hint="Para cambiar el correo, escríbenos." />
      <Field label="Nombre completo" name="full_name" defaultValue={profile.full_name} autoComplete="name" required error={e.full_name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Celular" name="phone" type="tel" defaultValue={profile.phone ?? ""} autoComplete="tel" error={e.phone} />
        <Field label="Documento de identidad" name="document_id" defaultValue={profile.document_id ?? ""} error={e.document_id} />
      </div>
      <Field label="Ciudad" name="city" defaultValue={profile.city ?? ""} autoComplete="address-level2" error={e.city} />
      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Guardando…">Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}
