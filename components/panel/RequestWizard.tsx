"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, ShieldCheck } from "lucide-react";
import type { Firm, LawyerWithRelations, Specialty } from "@/lib/types";
import { createRequest } from "@/lib/actions/panel";
import { Checkbox, Field, FieldError, FormMessage, Label, RequiredNote, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import { LawyerPortrait } from "@/components/site/LawyerCard";
import { reducedMotion } from "@/components/motion/MotionProvider";
import { DocPicker, stashPendingFiles } from "@/components/ui/Attachments";
import { ATTACHMENTS_PER_REQUEST } from "@/lib/validation";

const STEPS = ["Especialidad", "Abogado", "Confirmar", "Tu caso"];

const CONTACT_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp", hint: "Te escribimos al celular de tu perfil. Suele ser lo más rápido." },
  { value: "llamada", label: "Llamada", hint: "Te llamamos en horario de oficina." },
  { value: "correo", label: "Correo electrónico", hint: "Te respondemos al correo con el que ingresaste." },
] as const;

interface Props {
  specialties: Specialty[];
  lawyers: LawyerWithRelations[];
  firms: Firm[];
  initialSpecialty?: string;
  initialLawyer?: string;
}

/** Entrada de cada paso: 220 ms, solo opacidad y desplazamiento corto. */
const STEP_IN =
  "transition-[opacity,transform] duration-[220ms] ease-[var(--ease-out)] starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none";

export function RequestWizard({ specialties, lawyers, firms, initialSpecialty, initialLawyer }: Props) {
  const startSpec = specialties.find((s) => s.slug === initialSpecialty);
  const startLawyer = lawyers.find((l) => l.id === initialLawyer && (!startSpec || l.specialties.some((s) => s.slug === startSpec.slug)));
  const [spec, setSpec] = useState<Specialty | undefined>(startSpec);
  const [lawyerId, setLawyerId] = useState<string | "firma" | undefined>(startLawyer?.id);
  const [step, setStep] = useState(startSpec ? (startLawyer ? 2 : 1) : 0);
  const [contact, setContact] = useState<string>("whatsapp");
  const [docs, setDocs] = useState<File[]>([]);
  const { state, isPending, formProps } = useFormAction(createRequest);
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const candidates = useMemo(() => (spec ? lawyers.filter((l) => l.specialties.some((s) => s.slug === spec.slug)) : []), [spec, lawyers]);
  const lawyer = lawyers.find((l) => l.id === lawyerId);
  const e = state.errors ?? {};

  // Al cambiar de paso, el foco va al título del paso (no en la primera carga).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    stage.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, [step]);

  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  };
  const reachable = (i: number) => i === 0 || (i === 1 && !!spec) || (i >= 2 && !!spec && !!lawyerId);

  return (
    <div>
      {/* Progreso: cada paso completado se puede volver a abrir */}
      <nav aria-label="Pasos de la solicitud" className="mb-8">
        <p className="mb-3 text-[14px] text-ink-soft sm:hidden">
          Paso {step + 1} de {STEPS.length}: <span className="text-ink">{STEPS[step]}</span>
        </p>
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((label, i) => {
            const on = i === step;
            const done = i < step;
            const can = !on && reachable(i) && i < step;
            const inner = (
              <>
                <span aria-hidden className={`block h-1 transition-colors duration-200 ${on ? "bg-mist" : done ? "bg-mist/45" : "bg-white/[0.1]"}`} />
                <span className={`mt-2 hidden items-center gap-1.5 text-[14px] sm:flex ${on ? "text-ink" : "text-ink-soft"}`}>
                  {done ? <Check aria-hidden size={14} className="text-mist" /> : null}
                  {label}
                </span>
                <span className="sr-only">
                  {label}
                  {on ? " (paso actual)" : done ? " (completado)" : ""}
                </span>
              </>
            );
            return (
              <li key={label} aria-current={on ? "step" : undefined}>
                {can ? (
                  <button type="button" onClick={() => go(i)} className="block w-full text-left hover:[&>span]:text-ink">
                    {inner}
                  </button>
                ) : (
                  <div>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div ref={stage} key={step} className={STEP_IN}>
        {step === 0 ? (
          <section aria-labelledby="paso-titulo">
            <h2 id="paso-titulo" tabIndex={-1} className="text-[20px] font-semibold outline-none">
              ¿Sobre qué tema es tu asunto?
            </h2>
            <p className="mb-6 mt-1 text-[15px] text-ink-soft">Elige el área más cercana. Si te equivocas, el equipo reasigna tu solicitud sin costo.</p>
            <ul className="grid gap-2 md:grid-cols-2">
              {specialties.map((s) => {
                const on = spec?.slug === s.slug;
                return (
                  <li key={s.slug}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setSpec(s);
                        if (spec?.slug !== s.slug) setLawyerId(undefined);
                        go(1);
                      }}
                      className={`group grid h-full w-full grid-cols-[20px_1fr_auto] items-start gap-x-3 p-4 text-left transition-colors duration-150 active:scale-[0.99] ${
                        on ? "bg-navy" : "bg-graphite hover:bg-navy/70"
                      }`}
                    >
                      <SpecialtyIcon name={s.icon} size={18} className="mt-[3px] text-mist" />
                      <span>
                        <span className="block text-[16px] font-semibold">{s.name}</span>
                        <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{s.summary}</span>
                      </span>
                      <ArrowRight aria-hidden size={16} className="mt-1 text-ink-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {step === 1 && spec ? (
          <section aria-labelledby="paso-titulo">
            <h2 id="paso-titulo" tabIndex={-1} className="text-[20px] font-semibold outline-none">
              ¿Con quién quieres hablar?
            </h2>
            <p className="mb-6 mt-1 text-[15px] text-ink-soft">
              {candidates.length
                ? `${candidates.length} ${candidates.length === 1 ? "profesional atiende" : "profesionales atienden"} ${spec.short_name.toLowerCase()}. Elige uno o deja que la firma asigne según tu caso.`
                : `Aún no hay perfiles publicados en ${spec.short_name.toLowerCase()}: la firma asignará tu caso.`}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <li className="flex flex-col justify-between gap-4 bg-navy p-5 sm:col-span-2 xl:col-span-3 xl:flex-row xl:items-center">
                <div>
                  <p className="text-[16px] font-semibold">Que la firma asigne</p>
                  <p className="mt-1 max-w-[62ch] text-[14px] text-ink-soft">
                    El equipo lee tu caso y elige al profesional con más experiencia en ese tipo de asunto. Es la opción más rápida.
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={lawyerId === "firma"}
                  onClick={() => {
                    setLawyerId("firma");
                    go(2);
                  }}
                  className="btn btn-primary self-start xl:self-auto"
                >
                  Continuar sin elegir
                </button>
              </li>
              {candidates.map((l) => (
                <li key={l.id} className={`flex flex-col ${lawyerId === l.id ? "bg-navy" : "bg-graphite"}`}>
                  <div className="group grid grid-cols-[96px_1fr] gap-4 p-4">
                    <LawyerPortrait lawyer={l} sizes="96px" />
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold leading-snug">{l.full_name}</p>
                      <p className="mt-0.5 text-[13px] text-ink-soft">
                        {l.title}
                        {l.firm ? ` · ${l.firm.name}` : ""}
                      </p>
                      {l.years_experience ? (
                        <p className="mt-2 text-[13px] text-ink-soft">
                          <span className="tabular-nums text-ink">{l.years_experience}</span> años de experiencia
                        </p>
                      ) : null}
                      <p className={`mt-2 text-[13px] ${l.accepts_consultations ? "text-ink" : "text-ink-soft"}`}>
                        {l.accepts_consultations ? l.availability : "Sin cupo para nuevas consultas"}
                      </p>
                    </div>
                  </div>
                  {l.bio ? <p className="line-clamp-3 px-4 text-[14px] text-ink-soft">{l.bio}</p> : null}
                  <div className="mt-auto flex flex-wrap items-center gap-2 p-4">
                    <button
                      type="button"
                      disabled={!l.accepts_consultations}
                      aria-pressed={lawyerId === l.id}
                      onClick={() => {
                        setLawyerId(l.id);
                        go(2);
                      }}
                      className="btn btn-primary min-h-11"
                    >
                      Elegir
                    </button>
                    <Link href={`/abogados/${l.id}`} target="_blank" className="btn btn-ghost min-h-11 gap-1.5 text-[15px]">
                      Ver perfil <ExternalLink aria-hidden size={14} />
                      <span className="sr-only">(se abre en una pestaña nueva)</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => go(0)} className="btn btn-ghost mt-6">
              <ArrowLeft aria-hidden size={18} /> Cambiar especialidad
            </button>
          </section>
        ) : null}

        {step === 2 && spec ? (
          <section aria-labelledby="paso-titulo" className="max-w-[860px]">
            <h2 id="paso-titulo" tabIndex={-1} className="text-[20px] font-semibold outline-none">
              Revisa tu elección
            </h2>
            <p className="mb-6 mt-1 text-[15px] text-ink-soft">Puedes cambiar cualquiera de las dos antes de contarnos el caso.</p>
            <div className={`grid gap-6 bg-graphite p-5 ${lawyer ? "sm:grid-cols-[140px_1fr]" : ""}`}>
              {lawyer ? (
                <div className="group w-[140px]">
                  <LawyerPortrait lawyer={lawyer} sizes="140px" />
                </div>
              ) : null}
              <dl className="grid content-start gap-4 text-[15px] sm:grid-cols-2">
                <div>
                  <dt className="text-[13px] text-ink-soft">Especialidad</dt>
                  <dd className="mt-0.5">{spec.name}</dd>
                </div>
                <div>
                  <dt className="text-[13px] text-ink-soft">Profesional</dt>
                  <dd className="mt-0.5">{lawyer ? lawyer.full_name : "Asignación por la firma"}</dd>
                </div>
                {lawyer ? (
                  <div>
                    <dt className="text-[13px] text-ink-soft">Cargo</dt>
                    <dd className="mt-0.5">{lawyer.title}</dd>
                  </div>
                ) : null}
                {lawyer?.firm ? (
                  <div>
                    <dt className="text-[13px] text-ink-soft">Firma</dt>
                    <dd className="mt-0.5">{lawyer.firm.name}</dd>
                  </div>
                ) : null}
                {lawyer?.experience ? (
                  <div className="sm:col-span-2">
                    <dt className="text-[13px] text-ink-soft">Experiencia</dt>
                    <dd className="mt-0.5 line-clamp-4 text-ink-soft">{lawyer.experience}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <div className="mt-4 flex items-start gap-3 bg-navy p-4 text-[14px]">
              <ShieldCheck aria-hidden size={18} className="mt-0.5 shrink-0 text-mist" />
              <p>
                Elegir un abogado o una firma no es una contratación ni crea una relación abogado-cliente. La firma revisará tu solicitud y te
                contactará; la relación empieza solo si apruebas una propuesta de servicios.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(3)} className="btn btn-primary">
                Continuar <ArrowRight aria-hidden size={18} />
              </button>
              <button type="button" onClick={() => go(1)} className="btn btn-ghost">
                <ArrowLeft aria-hidden size={18} /> Cambiar abogado
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 && spec ? (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <form
              {...formProps}
              onSubmit={(ev) => {
                // Los documentos no viajan con la solicitud: se suben en su ficha, justo después de crearla.
                stashPendingFiles(docs);
                formProps.onSubmit(ev);
              }}
              noValidate
              className="grid max-w-[720px] gap-6"
              aria-labelledby="paso-titulo"
            >
              <div>
                <h2 id="paso-titulo" tabIndex={-1} className="text-[20px] font-semibold outline-none">
                  Cuéntanos tu caso
                </h2>
                <p className="mt-1 text-[15px] text-ink-soft">Con lo que escribas aquí el abogado prepara la primera conversación. Toma unos 5 minutos.</p>
                <div className="mt-3">
                  <RequiredNote />
                </div>
              </div>
              <input type="hidden" name="specialty_id" value={spec.id} />
              <input type="hidden" name="lawyer_id" value={lawyer?.id ?? ""} />
              {!lawyer && firms.length > 1 ? (
                <Select
                  label="Firma de preferencia"
                  name="firm_id"
                  defaultValue=""
                  error={e.firm_id}
                  hint="Opcional. Si ya conoces una de las firmas, elígela; si no, el equipo decide."
                >
                  <option value="">Sin preferencia</option>
                  {firms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.city ? ` (${f.city})` : ""}
                    </option>
                  ))}
                </Select>
              ) : (
                <input type="hidden" name="firm_id" value={lawyer?.firm_id ?? ""} />
              )}
              <Field
                label="Asunto"
                name="subject"
                required
                maxLength={140}
                autoComplete="off"
                placeholder="Ej.: Fotomulta que no me notificaron"
                hint="Una frase corta que resuma tu situación (entre 5 y 140 caracteres)."
                error={e.subject}
              />
              <TextArea
                label="Descripción del caso"
                name="description"
                required
                minChars={20}
                maxLength={4000}
                rows={8}
                placeholder="Ej.: El 3 de octubre recibí por correo una fotomulta de una infracción del 12 de junio. Nunca me notificaron a tiempo y quiero saber si puedo pedir que la anulen."
                hint={
                  <>
                    Incluye qué pasó y cuándo, quiénes están involucrados, qué documentos tienes (multas, contratos, citaciones) y qué esperas lograr. No
                    escribas contraseñas, números de tarjeta ni claves bancarias.
                  </>
                }
                error={e.description}
              />

              <fieldset aria-describedby={e.preferred_contact ? "f-preferred_contact-err" : undefined}>
                <Label as="legend" required>
                  ¿Cómo prefieres que te contactemos?
                </Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {CONTACT_OPTIONS.map((o) => {
                    const on = contact === o.value;
                    return (
                      <label
                        key={o.value}
                        className={`relative flex cursor-pointer flex-col gap-1 p-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mist ${
                          on ? "bg-navy" : "bg-graphite hover:bg-navy/60"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-[15px] font-medium">
                          <input
                            type="radio"
                            name="preferred_contact"
                            value={o.value}
                            checked={on}
                            onChange={() => setContact(o.value)}
                            className="h-4 w-4 accent-[var(--mist)]"
                            aria-describedby={`pc-${o.value}`}
                          />
                          {o.label}
                        </span>
                        <span id={`pc-${o.value}`} className="pl-6 text-[13px] leading-snug text-ink-soft">
                          {o.hint}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <FieldError id="f-preferred_contact-err" error={e.preferred_contact} />
              </fieldset>

              <section aria-labelledby="docs-titulo" className="grid gap-3 border-t border-white/[0.06] pt-6">
                <div>
                  <h3 id="docs-titulo" className="text-[16px] font-semibold">
                    Adjunta documentos <span className="font-normal text-ink-soft">(opcional)</span>
                  </h3>
                  <p className="mt-1 text-[14px] text-ink-soft">
                    Ayudan al abogado a entender el caso antes de llamarte. Puedes agregarlos también después, desde la ficha de la solicitud.
                  </p>
                </div>
                <DocPicker
                  label="Documentos del caso"
                  files={docs}
                  onChange={setDocs}
                  max={ATTACHMENTS_PER_REQUEST}
                  disabled={isPending}
                  hint={`Hasta ${ATTACHMENTS_PER_REQUEST} archivos en imagen (JPG, PNG, WEBP) o PDF, de máximo 10 MB cada uno. Por ejemplo: el comparendo o la fotomulta, la notificación que recibiste, el contrato, o capturas de pantalla de mensajes.`}
                />
              </section>

              <div className="grid gap-4 border-t border-white/[0.06] pt-6">
                <Checkbox name="no_relationship_ack" required error={e.no_relationship_ack}>
                  Entiendo que enviar esta solicitud no constituye contratación ni crea una relación abogado-cliente.
                </Checkbox>
                <Checkbox
                  name="data_consent"
                  required
                  error={e.data_consent}
                  hint="Tus datos se tratan con reserva, solo para atender esta solicitud, conforme a la Ley 1581 de 2012."
                >
                  Autorizo el tratamiento de mis datos personales, incluidos los datos sensibles que describa, según la{" "}
                  <Link href="/legal/tratamiento-datos" target="_blank" className="link text-ink">
                    política de tratamiento de datos
                  </Link>
                  .
                </Checkbox>
              </div>
              {e.specialty_id || e.lawyer_id ? (
                <p role="alert" className="text-[14px] text-danger">
                  {e.specialty_id || e.lawyer_id}
                </p>
              ) : null}
              <FormMessage state={state} />
              <div className="flex flex-wrap gap-3">
                <SubmitButton busy={isPending} pending="Enviando solicitud…">
                  Enviar solicitud
                </SubmitButton>
                <button type="button" onClick={() => go(2)} className="btn btn-ghost">
                  <ArrowLeft aria-hidden size={18} /> Atrás
                </button>
              </div>
            </form>

            <aside aria-label="Resumen de tu solicitud" className="grid gap-4 lg:sticky lg:top-24">
              <div className="bg-graphite p-5">
                <p className="text-[13px] text-ink-soft">Especialidad</p>
                <p className="mt-0.5 text-[15px]">{spec.name}</p>
                <p className="mt-4 text-[13px] text-ink-soft">Profesional</p>
                <p className="mt-0.5 text-[15px]">{lawyer ? lawyer.full_name : "Asignación por la firma"}</p>
                <button type="button" onClick={() => go(1)} className="link mt-4 text-[14px] text-ink-soft">
                  Cambiar
                </button>
              </div>
              <div className="bg-graphite p-5 text-[14px]">
                <p className="font-medium">Qué pasa después</p>
                <ul className="mt-3 grid gap-2 text-ink-soft">
                  <li>Verás la solicitud en «Mis solicitudes» como pendiente{docs.length ? " y tus documentos se subirán en su ficha" : ""}.</li>
                  <li>El equipo la revisa y te contacta por el medio que elegiste.</li>
                  <li>Solo si apruebas una propuesta de servicios empieza la relación con la firma.</li>
                </ul>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
