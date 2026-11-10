"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { ActionState } from "@/lib/validation";

export function SubmitButton({
  children,
  pending: pendingLabel = "Enviando…",
  className = "btn btn-primary",
  busy,
}: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
  /** Estado de envío cuando el formulario usa onSubmit (useFormAction). */
  busy?: boolean;
}) {
  const status = useFormStatus();
  const pending = busy ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 aria-hidden size={18} className="animate-spin motion-reduce:animate-none" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Ids de la ayuda y del error de un campo, en el orden en que se leen. */
function describedBy(fid: string, hint?: React.ReactNode, error?: string, extra?: string) {
  return [hint ? `${fid}-hint` : null, extra ?? null, error ? `${fid}-err` : null].filter(Boolean).join(" ") || undefined;
}

/** Etiqueta con marca de obligatorio (visible y para lectores de pantalla). */
export function Label({ htmlFor, children, required, as = "label" }: { htmlFor?: string; children: React.ReactNode; required?: boolean; as?: "label" | "legend" | "span" }) {
  const inner = (
    <>
      {children}
      {required ? (
        <>
          <span aria-hidden className="ml-1 text-mist">*</span>
          <span className="sr-only"> (obligatorio)</span>
        </>
      ) : null}
    </>
  );
  if (as === "legend") return <legend className="label">{inner}</legend>;
  if (as === "span") return <span className="label">{inner}</span>;
  return (
    <label htmlFor={htmlFor} className="label">
      {inner}
    </label>
  );
}

export function Hint({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-[14px] leading-snug text-ink-soft">
      {children}
    </p>
  );
}

/** Nota al inicio de un formulario que explica el asterisco. */
export function RequiredNote() {
  return (
    <p className="text-[14px] text-ink-soft">
      Los campos marcados con <span aria-hidden className="text-mist">*</span>
      <span className="sr-only">asterisco</span> son obligatorios.
    </p>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
}

export function Field({ label, name, error, hint, id, required, ...rest }: FieldProps) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <Label htmlFor={fid} required={required}>
        {label}
      </Label>
      <input
        id={fid}
        name={name}
        className="field"
        required={required}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy(fid, hint, error)}
        {...rest}
      />
      <Hint id={`${fid}-hint`}>{hint}</Hint>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

interface AreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
  /** Mínimo de caracteres que exige la validación; se muestra en el contador. */
  minChars?: number;
}

export function TextArea({ label, name, error, hint, id, required, maxLength, minChars, defaultValue, onChange, ...rest }: AreaProps) {
  const fid = id ?? `f-${name}`;
  const [count, setCount] = useState(typeof defaultValue === "string" ? defaultValue.length : 0);
  const showCount = !!maxLength;
  const short = minChars ? count > 0 && count < minChars : false;
  return (
    <div>
      <Label htmlFor={fid} required={required}>
        {label}
      </Label>
      <textarea
        id={fid}
        name={name}
        className="field"
        required={required}
        aria-required={required || undefined}
        maxLength={maxLength}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        aria-describedby={describedBy(fid, hint, error, showCount ? `${fid}-count` : undefined)}
        onChange={(ev) => {
          setCount(ev.target.value.length);
          onChange?.(ev);
        }}
        {...rest}
      />
      <div className="mt-1.5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Hint id={`${fid}-hint`}>{hint}</Hint>
        </div>
        {showCount ? (
          <p id={`${fid}-count`} className={`shrink-0 text-[13px] tabular-nums ${short ? "text-ink" : "text-ink-soft"}`}>
            {short && minChars ? `${count} de ${minChars} mínimo` : `${count.toLocaleString("es-CO")} / ${maxLength!.toLocaleString("es-CO")}`}
          </p>
        ) : null}
      </div>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

export function Select({ label, name, error, hint, id, required, children, ...rest }: SelectProps) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <Label htmlFor={fid} required={required}>
        {label}
      </Label>
      <select
        id={fid}
        name={name}
        className="field"
        required={required}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy(fid, hint, error)}
        {...rest}
      >
        {children}
      </select>
      <Hint id={`${fid}-hint`}>{hint}</Hint>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

export function Checkbox({
  name,
  error,
  hint,
  children,
  defaultChecked,
  required,
  value,
  id,
}: {
  name: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  defaultChecked?: boolean;
  required?: boolean;
  value?: string;
  id?: string;
}) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <label htmlFor={fid} className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-ink">
        <input
          id={fid}
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy(fid, hint, error)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--mist)]"
        />
        <span>
          {children}
          {required ? (
            <>
              <span aria-hidden className="ml-1 text-mist">*</span>
              <span className="sr-only"> (obligatorio)</span>
            </>
          ) : null}
        </span>
      </label>
      {hint ? (
        <div className="pl-8">
          <Hint id={`${fid}-hint`}>{hint}</Hint>
        </div>
      ) : null}
      <div className="pl-8">
        <FieldError id={`${fid}-err`} error={error} />
      </div>
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[14px] text-danger">
      <AlertCircle aria-hidden size={15} className="mt-[3px] shrink-0" />
      <span>{error}</span>
    </p>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={`flex items-start gap-3 p-4 text-[15px] ${state.ok ? "bg-navy text-ink" : "bg-danger-bg text-ink"}`}
    >
      {state.ok ? <CheckCircle2 aria-hidden size={20} className="shrink-0 text-mist" /> : <AlertCircle aria-hidden size={20} className="shrink-0 text-danger" />}
      <span>{state.message}</span>
    </div>
  );
}
