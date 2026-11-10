"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { useEffect, useRef } from "react";
import { saveFirm } from "@/lib/actions/admin";
import { Checkbox, Field, FormMessage, SubmitButton, TextArea } from "@/components/ui/Form";
import type { Firm } from "@/lib/types";

export function FirmForm({ firm }: { firm?: Firm }) {
  const { state, isPending, formProps } = useFormAction(saveFirm);
  const ref = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};
  const k = firm?.id ?? "new";
  useEffect(() => {
    if (state.ok && !firm) ref.current?.reset();
  }, [state, firm]);
  return (
    <form ref={ref} {...formProps} noValidate className="grid gap-5">
      {firm ? <input type="hidden" name="id" value={firm.id} /> : null}
      <Field
        label="Nombre"
        name="name"
        id={`name-${k}`}
        defaultValue={firm?.name}
        required
        maxLength={120}
        autoComplete="organization"
        placeholder="Ej.: Restrepo & Asociados Abogados"
        hint="Razón social o nombre comercial, como aparecerá en los perfiles."
        error={e.name}
      />
      <TextArea
        label="Descripción"
        name="description"
        id={`desc-${k}`}
        rows={3}
        maxLength={2000}
        defaultValue={firm?.description}
        hint="Opcional. Una o dos frases sobre la firma y su enfoque."
        error={e.description}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Ciudad"
          name="city"
          id={`city-${k}`}
          defaultValue={firm?.city ?? ""}
          maxLength={80}
          autoComplete="address-level2"
          placeholder="Ej.: Bogotá"
          hint="Opcional. Sede principal."
          error={e.city}
        />
        <Field
          label="Sitio web"
          name="website"
          id={`web-${k}`}
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://www.ejemplo.com.co"
          defaultValue={firm?.website ?? ""}
          hint="Opcional. Dirección completa, con https://."
          error={e.website}
        />
      </div>
      <Checkbox name="is_active" id={`active-${k}`} defaultChecked={firm?.is_active ?? true} hint="Las firmas inactivas no aparecen como opción al crear una solicitud.">
        Firma activa
      </Checkbox>
      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Guardando…">
          {firm ? "Guardar cambios" : "Registrar firma"}
        </SubmitButton>
      </div>
    </form>
  );
}
