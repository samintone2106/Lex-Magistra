"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { requestPasswordReset, signIn, signUp, updatePassword } from "@/lib/actions/auth";
import { Checkbox, Field, FormMessage, SubmitButton } from "@/components/ui/Form";

function PasswordField({ name, label, error, autoComplete }: { name: string; label: string; error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Field label={label} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required error={error} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-1 top-[30px] grid h-11 w-11 place-items-center text-ink-soft hover:text-ink"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
      </button>
    </div>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const { state, isPending, formProps } = useFormAction(signIn);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <input type="hidden" name="next" value={next ?? "/panel"} />
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required error={e.email} />
      <PasswordField label="Contraseña" name="password" autoComplete="current-password" error={e.password} />
      <div className="-mt-2 text-right">
        <Link href="/recuperar" className="link text-[15px] text-ink-soft">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Ingresando…">Iniciar sesión</SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const { state, isPending, formProps } = useFormAction(signUp);
  const e = state.errors ?? {};
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <Field label="Nombre completo" name="full_name" autoComplete="name" required error={e.full_name} />
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required error={e.email} />
      <Field label="Celular (opcional)" name="phone" type="tel" autoComplete="tel" error={e.phone} />
      <PasswordField label="Contraseña" name="password" autoComplete="new-password" error={e.password} />
      <Field label="Confirmar contraseña" name="password_confirm" type="password" autoComplete="new-password" required error={e.password_confirm} hint="Mínimo 8 caracteres, con letras y números." />
      <Checkbox name="data_consent" error={e.data_consent}>
        Acepto los{" "}
        <Link href="/legal/terminos" className="link text-ink" target="_blank">términos y condiciones</Link> y autorizo el tratamiento de mis
        datos personales según la{" "}
        <Link href="/legal/tratamiento-datos" className="link text-ink" target="_blank">política de tratamiento de datos</Link>.
      </Checkbox>
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Creando cuenta…">Crear cuenta</SubmitButton>
    </form>
  );
}

export function ResetRequestForm() {
  const { state, isPending, formProps } = useFormAction(requestPasswordReset);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required error={e.email} />
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Enviando…">Enviar enlace</SubmitButton>
    </form>
  );
}

export function NewPasswordForm() {
  const { state, isPending, formProps } = useFormAction(updatePassword);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <PasswordField label="Nueva contraseña" name="password" autoComplete="new-password" error={e.password} />
      <Field label="Confirmar contraseña" name="password_confirm" type="password" autoComplete="new-password" required error={e.password_confirm} />
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Guardando…">Guardar contraseña</SubmitButton>
    </form>
  );
}
