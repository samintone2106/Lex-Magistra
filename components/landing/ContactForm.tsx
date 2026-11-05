"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { sendContactMessage } from "@/lib/actions/public";
import { Checkbox, Field, FormMessage, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import type { Specialty } from "@/lib/types";

export function ContactForm({ specialties }: { specialties: Pick<Specialty, "id" | "name" | "slug">[] }) {
  const { state, isPending, formProps } = useFormAction(sendContactMessage);
  const form = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  // Las especialidades de respaldo (sin BD) no tienen uuid: no se envían.
  const selectable = specialties.filter((s) => /^[0-9a-f-]{36}$/i.test(s.id));

  return (
    <form ref={form} {...formProps} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre completo" name="full_name" autoComplete="name" required error={e.full_name} />
        <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required error={e.email} />
        <Field label="Teléfono (opcional)" name="phone" type="tel" autoComplete="tel" error={e.phone} />
        <Select label="Área de interés (opcional)" name="specialty_id" defaultValue="" error={e.specialty_id}>
          <option value="">No estoy seguro</option>
          {selectable.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <TextArea label="¿En qué te podemos ayudar?" name="message" required rows={5} error={e.message} />
      {/* honeypot */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="f-website">No llenar</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Checkbox name="data_consent" error={e.data_consent}>
        Autorizo el tratamiento de mis datos personales conforme a la{" "}
        <Link href="/legal/tratamiento-datos" className="link text-ink">
          política de tratamiento de datos
        </Link>
        . La información que comparta será tratada de forma confidencial.
      </Checkbox>
      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending}>Enviar mensaje</SubmitButton>
      </div>
    </form>
  );
}
