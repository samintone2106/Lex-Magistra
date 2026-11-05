"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { useEffect, useRef } from "react";
import { saveFirm } from "@/lib/actions/admin";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/ui/Form";
import type { Firm } from "@/lib/types";

export function FirmForm({ firm }: { firm?: Firm }) {
  const { state, isPending, formProps } = useFormAction(saveFirm);
  const ref = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};
  useEffect(() => {
    if (state.ok && !firm) ref.current?.reset();
  }, [state, firm]);
  return (
    <form ref={ref} {...formProps} noValidate className="grid gap-4">
      {firm ? <input type="hidden" name="id" value={firm.id} /> : null}
      <Field label="Nombre" name="name" id={`name-${firm?.id ?? "new"}`} defaultValue={firm?.name} required error={e.name} />
      <TextArea label="Descripción" name="description" id={`desc-${firm?.id ?? "new"}`} rows={3} defaultValue={firm?.description} error={e.description} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ciudad" name="city" id={`city-${firm?.id ?? "new"}`} defaultValue={firm?.city ?? ""} error={e.city} />
        <Field label="Sitio web" name="website" id={`web-${firm?.id ?? "new"}`} type="url" placeholder="https://" defaultValue={firm?.website ?? ""} error={e.website} />
      </div>
      <label className="flex items-center gap-3 text-[15px]">
        <input type="checkbox" name="is_active" defaultChecked={firm?.is_active ?? true} className="h-5 w-5 accent-[var(--mist)]" /> Activa
      </label>
      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Guardando…">{firm ? "Guardar" : "Registrar firma"}</SubmitButton>
      </div>
    </form>
  );
}
