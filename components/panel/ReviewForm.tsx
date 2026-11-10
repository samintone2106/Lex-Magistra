"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/lib/actions/panel";
import { Checkbox, Field, FieldError, FormMessage, Label, RequiredNote, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import type { LawyerWithRelations, Specialty } from "@/lib/types";

const RATING_WORDS = ["", "Mala", "Regular", "Buena", "Muy buena", "Excelente"];

export function ReviewForm({ specialties, lawyers, defaultName }: { specialties: Specialty[]; lawyers: LawyerWithRelations[]; defaultName: string }) {
  const { state, isPending, formProps } = useFormAction(createReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const group = useRef<HTMLDivElement>(null);
  const e = state.errors ?? {};

  // Tras enviar con éxito, el formulario vuelve a quedar en blanco.
  useEffect(() => {
    if (state.ok) {
      setRating(0);
      setFormKey((k) => k + 1);
    }
  }, [state]);

  // Flechas para moverse entre estrellas, como en un grupo de radios nativo.
  const onKey = (ev: React.KeyboardEvent) => {
    const next = ev.key === "ArrowRight" || ev.key === "ArrowUp" ? Math.min(5, (rating || 0) + 1) : ev.key === "ArrowLeft" || ev.key === "ArrowDown" ? Math.max(1, (rating || 2) - 1) : 0;
    if (!next) return;
    ev.preventDefault();
    setRating(next);
    group.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next - 1]?.focus();
  };

  const shown = hover || rating;

  return (
    <form key={formKey} {...formProps} noValidate className="grid gap-6">
      <RequiredNote />
      <fieldset aria-describedby={["f-rating-hint", e.rating ? "f-rating-err" : ""].filter(Boolean).join(" ")}>
        <Label as="legend" required>
          ¿Cómo calificas la atención?
        </Label>
        <div className="flex flex-wrap items-center gap-4">
          <div
            ref={group}
            className="flex"
            role="radiogroup"
            aria-label="Calificación de 1 a 5 estrellas"
            aria-invalid={!!e.rating}
            onMouseLeave={() => setHover(0)}
            onKeyDown={onKey}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                tabIndex={rating ? (rating === n ? 0 : -1) : n === 1 ? 0 : -1}
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}: ${RATING_WORDS[n]}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="grid h-11 w-11 place-items-center text-mist transition-transform duration-150 ease-[var(--ease-out)] active:scale-90"
              >
                <Star aria-hidden size={28} strokeWidth={1.5} fill={shown >= n ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <span aria-live="polite" className="min-w-[10ch] text-[15px] text-ink">
            {shown ? `${shown} de 5 · ${RATING_WORDS[shown]}` : <span className="text-ink-soft">Sin calificar</span>}
          </span>
        </div>
        <p id="f-rating-hint" className="mt-1.5 text-[14px] text-ink-soft">
          Toca una estrella o usa las flechas del teclado.
        </p>
        <input type="hidden" name="rating" value={rating || ""} />
        <FieldError id="f-rating-err" error={e.rating} />
      </fieldset>

      <TextArea
        label="Tu opinión"
        name="comment"
        rows={5}
        minChars={20}
        maxLength={1500}
        required
        error={e.comment}
        placeholder="Ej.: Me explicaron mis opciones con claridad y me respondieron rápido por WhatsApp."
        hint="Cuenta cómo fue la atención: claridad, tiempos, trato. No incluyas datos de tu caso, números de proceso ni nombres de terceros."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Especialidad" name="specialty_id" defaultValue="" error={e.specialty_id} hint="Opcional. El área en la que te atendieron.">
          <option value="">Ninguna en particular</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.short_name}
            </option>
          ))}
        </Select>
        <Select label="Abogado" name="lawyer_id" defaultValue="" error={e.lawyer_id} hint="Opcional. Tu opinión aparecerá en su perfil.">
          <option value="">Ninguno en particular</option>
          {lawyers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.full_name}
            </option>
          ))}
        </Select>
      </div>

      <Field
        label="Nombre público"
        name="public_name"
        defaultValue={defaultName}
        required
        maxLength={80}
        autoComplete="off"
        placeholder="Ej.: María G."
        error={e.public_name}
        hint="Recomendamos tu nombre y la inicial del apellido."
      />
      <Checkbox name="show_name" hint="Si no la marcas, tu opinión aparecerá firmada como «Cliente verificado».">
        Autorizo mostrar este nombre junto a mi opinión.
      </Checkbox>
      <FormMessage state={state} />
      <div className="flex justify-end border-t border-white/[0.06] pt-5">
        <SubmitButton busy={isPending} pending="Enviando…">
          Enviar opinión
        </SubmitButton>
      </div>
    </form>
  );
}
