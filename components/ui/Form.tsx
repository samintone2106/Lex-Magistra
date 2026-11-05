"use client";

import { useFormStatus } from "react-dom";
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
          <Loader2 aria-hidden size={18} className="animate-spin" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export function Field({ label, name, error, hint, id, ...rest }: FieldProps) {
  const fid = id ?? `f-${name}`;
  const describedBy = [error ? `${fid}-err` : null, hint ? `${fid}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      <input id={fid} name={name} className="field" aria-invalid={!!error} aria-describedby={describedBy} {...rest} />
      {hint ? <p id={`${fid}-hint`} className="mt-1 text-[14px] text-ink-soft">{hint}</p> : null}
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

interface AreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
}

export function TextArea({ label, name, error, id, ...rest }: AreaProps) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      <textarea id={fid} name={name} className="field" aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined} {...rest} />
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, name, error, id, children, ...rest }: SelectProps) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      <select id={fid} name={name} className="field" aria-invalid={!!error} {...rest}>
        {children}
      </select>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

export function Checkbox({
  name,
  error,
  children,
  defaultChecked,
}: {
  name: string;
  error?: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
}) {
  const fid = `f-${name}`;
  return (
    <div>
      <label htmlFor={fid} className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-ink-soft">
        <input
          id={fid}
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          aria-invalid={!!error}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--mist)]"
        />
        <span>{children}</span>
      </label>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-[14px] text-danger">
      {error}
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
