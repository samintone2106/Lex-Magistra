"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { initialState, type ActionState } from "@/lib/validation";

/**
 * Envía el formulario a una Server Action sin el reseteo automático de React 19,
 * para que el usuario no pierda lo escrito cuando hay errores de validación.
 */
export function useFormAction(action: (prev: ActionState, fd: FormData) => Promise<ActionState>) {
  const [state, dispatch, isPending] = useActionState(action, initialState);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return { state, isPending, formProps: { onSubmit } };
}
