"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { gsap } from "gsap";
import { createReview } from "@/lib/actions/panel";
import { Checkbox, Field, FieldError, FormMessage, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import type { LawyerWithRelations, Specialty } from "@/lib/types";
import { reducedMotion } from "@/components/motion/MotionProvider";

export function ReviewForm({ specialties, lawyers, defaultName }: { specialties: Specialty[]; lawyers: LawyerWithRelations[]; defaultName: string }) {
  const { state, isPending, formProps } = useFormAction(createReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const stars = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.ok) {
      form.current?.reset();
      setRating(0);
    }
  }, [state]);

  const pick = (n: number) => {
    setRating(n);
    if (!reducedMotion() && stars.current) {
      gsap.fromTo(stars.current.children[n - 1], { scale: 1.6 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    }
  };

  return (
    <form ref={form} {...formProps} noValidate className="grid max-w-[640px] gap-5">
      <fieldset>
        <legend className="label">Calificación</legend>
        <div ref={stars} className="flex gap-1" role="radiogroup" aria-label="Calificación de 1 a 5 estrellas" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              onClick={() => pick(n)}
              onMouseEnter={() => setHover(n)}
              className="grid h-12 w-12 place-items-center text-mist"
            >
              <Star aria-hidden size={30} strokeWidth={1.5} fill={(hover || rating) >= n ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating || ""} />
        <FieldError id="f-rating-err" error={e.rating} />
      </fieldset>
      <TextArea label="Tu opinión" name="comment" rows={5} maxLength={1500} required error={e.comment} placeholder="Cuéntanos cómo fue la atención. No incluyas datos de tu caso ni de terceros." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Especialidad (opcional)" name="specialty_id" defaultValue="" error={e.specialty_id}>
          <option value="">Ninguna</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.short_name}</option>
          ))}
        </Select>
        <Select label="Abogado (opcional)" name="lawyer_id" defaultValue="" error={e.lawyer_id}>
          <option value="">Ninguno</option>
          {lawyers.map((l) => (
            <option key={l.id} value={l.id}>{l.full_name}</option>
          ))}
        </Select>
      </div>
      <Field label="Nombre público" name="public_name" defaultValue={defaultName} required maxLength={80} error={e.public_name} hint="Por ejemplo, tu nombre y la inicial del apellido." />
      <Checkbox name="show_name">Autorizo mostrar este nombre junto a mi opinión. Si no marcas esta casilla, aparecerá como «Cliente verificado».</Checkbox>
      <FormMessage state={state} />
      <div>
        <SubmitButton busy={isPending} pending="Enviando…">Enviar opinión</SubmitButton>
      </div>
    </form>
  );
}
