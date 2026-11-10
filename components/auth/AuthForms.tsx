"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import Link from "next/link";
import { useState } from "react";
import { Check, Eye, EyeOff, MailCheck } from "lucide-react";
import { requestPasswordReset, signIn, signUp, updatePassword } from "@/lib/actions/auth";
import { Checkbox, Field, FieldError, FormMessage, Hint, Label, RequiredNote, SubmitButton } from "@/components/ui/Form";

/** Reglas de la contraseña: las mismas que valida el servidor (lib/validation.ts). */
const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "Al menos 8 caracteres", test: (v) => v.length >= 8 },
  { label: "Al menos una letra", test: (v) => /[A-Za-z]/.test(v) },
  { label: "Al menos un número", test: (v) => /\d/.test(v) },
];

function PasswordField({
  name,
  label,
  error,
  autoComplete,
  hint,
  onValue,
  describedBy,
}: {
  name: string;
  label: string;
  error?: string;
  autoComplete: string;
  hint?: React.ReactNode;
  onValue?: (v: string) => void;
  /** Id extra para aria-describedby (la lista de reglas). */
  describedBy?: string;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const fid = `f-${name}`;
  const ids = [hint ? `${fid}-hint` : null, describedBy ?? null, caps ? `${fid}-caps` : null, error ? `${fid}-err` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <Label htmlFor={fid} required>
        {label}
      </Label>
      <div className="relative">
        <input
          id={fid}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          aria-required
          maxLength={72}
          aria-invalid={!!error}
          aria-describedby={ids}
          className="field pr-12"
          onChange={(ev) => onValue?.(ev.target.value)}
          onKeyUp={(ev) => setCaps(ev.getModifierState("CapsLock"))}
          onBlur={() => setCaps(false)}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-ink-soft transition-colors hover:text-ink"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
          aria-controls={fid}
        >
          {show ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
        </button>
      </div>
      {caps ? (
        <p id={`${fid}-caps`} className="mt-1.5 text-[14px] text-ink">
          Bloq Mayús está activado.
        </p>
      ) : null}
      <Hint id={`${fid}-hint`}>{hint}</Hint>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

/** Lista de reglas que se marca mientras se escribe. */
function PasswordRules({ id, value, confirm }: { id: string; value: string; confirm?: string }) {
  const rows = [...RULES.map((r) => ({ label: r.label, ok: r.test(value) }))];
  if (confirm !== undefined) rows.push({ label: "Las dos contraseñas coinciden", ok: !!value && value === confirm });
  return (
    <ul id={id} aria-label="Requisitos de la contraseña" className="grid gap-1.5 bg-graphite p-4 text-[14px] sm:grid-cols-2">
      {rows.map((r) => (
        <li key={r.label} className={`flex items-center gap-2 transition-colors duration-150 ${r.ok ? "text-ink" : "text-ink-soft"}`}>
          {r.ok ? (
            <Check aria-hidden size={15} className="shrink-0 text-mist" />
          ) : (
            <span aria-hidden className="mx-[4px] h-1.5 w-1.5 shrink-0 border border-ink-soft" />
          )}
          {r.label}
          <span className="sr-only">{r.ok ? ": cumplido" : ": pendiente"}</span>
        </li>
      ))}
    </ul>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const { state, isPending, formProps } = useFormAction(signIn);
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <input type="hidden" name="next" value={next ?? "/panel"} />
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="nombre@correo.com"
        required
        error={e.email}
      />
      <div>
        <PasswordField label="Contraseña" name="password" autoComplete="current-password" error={e.password} />
        <div className="mt-2 text-right">
          <Link href="/recuperar" className="link text-[14px] text-ink-soft">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Ingresando…">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const { state, isPending, formProps } = useFormAction(signUp);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const e = state.errors ?? {};
  if (state.ok) {
    return (
      <div role="status" className="grid gap-4 bg-navy p-6">
        <MailCheck aria-hidden size={28} className="text-mist" />
        <p className="text-[18px] font-semibold">Revisa tu correo</p>
        <p className="text-[15px]">{state.message}</p>
        <p className="text-[14px] text-ink-soft">Si no lo ves en unos minutos, busca en la carpeta de spam o promociones.</p>
      </div>
    );
  }
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <RequiredNote />
      <Field
        label="Nombre completo"
        name="full_name"
        autoComplete="name"
        maxLength={120}
        placeholder="Ej.: María Fernanda Gómez Ríos"
        hint="Como aparece en tu documento de identidad."
        required
        error={e.full_name}
      />
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="nombre@correo.com"
        hint="Te enviaremos un enlace para confirmar la cuenta."
        required
        error={e.email}
      />
      <Field
        label="Celular"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={30}
        placeholder="300 123 4567"
        hint="Opcional. Lo usamos para responderte por WhatsApp o llamada."
        error={e.phone}
      />
      <PasswordField label="Contraseña" name="password" autoComplete="new-password" error={e.password} onValue={setPw} describedBy="pw-rules" />
      <PasswordField label="Confirmar contraseña" name="password_confirm" autoComplete="new-password" error={e.password_confirm} onValue={setPw2} describedBy="pw-rules" />
      <PasswordRules id="pw-rules" value={pw} confirm={pw2} />
      <Checkbox
        name="data_consent"
        required
        error={e.data_consent}
        hint="Usamos tus datos solo para atender tus solicitudes, conforme a la Ley 1581 de 2012."
      >
        Acepto los{" "}
        <Link href="/legal/terminos" className="link text-ink" target="_blank">
          términos y condiciones
        </Link>{" "}
        y autorizo el tratamiento de mis datos personales según la{" "}
        <Link href="/legal/tratamiento-datos" className="link text-ink" target="_blank">
          política de tratamiento de datos
        </Link>
        .
      </Checkbox>
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Creando cuenta…">
        Crear cuenta
      </SubmitButton>
    </form>
  );
}

export function ResetRequestForm() {
  const { state, isPending, formProps } = useFormAction(requestPasswordReset);
  const e = state.errors ?? {};
  if (state.ok) {
    return (
      <div role="status" className="grid gap-4 bg-navy p-6">
        <MailCheck aria-hidden size={28} className="text-mist" />
        <p className="text-[15px]">{state.message}</p>
        <p className="text-[14px] text-ink-soft">El enlace vence en poco tiempo. Si no llega, revisa la carpeta de spam o solicítalo otra vez.</p>
      </div>
    );
  }
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="nombre@correo.com"
        hint="El mismo con el que creaste tu cuenta."
        required
        error={e.email}
      />
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Enviando…">
        Enviar enlace
      </SubmitButton>
    </form>
  );
}

export function NewPasswordForm() {
  const { state, isPending, formProps } = useFormAction(updatePassword);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const e = state.errors ?? {};
  return (
    <form {...formProps} noValidate className="grid gap-5">
      <PasswordField label="Nueva contraseña" name="password" autoComplete="new-password" error={e.password} onValue={setPw} describedBy="pw-rules" />
      <PasswordField label="Confirmar contraseña" name="password_confirm" autoComplete="new-password" error={e.password_confirm} onValue={setPw2} describedBy="pw-rules" />
      <PasswordRules id="pw-rules" value={pw} confirm={pw2} />
      <FormMessage state={state} />
      <SubmitButton busy={isPending} pending="Guardando…">
        Guardar contraseña
      </SubmitButton>
    </form>
  );
}
