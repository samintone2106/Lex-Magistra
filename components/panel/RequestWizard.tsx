"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ArrowLeft, Check } from "lucide-react";
import type { Firm, LawyerWithRelations, Specialty } from "@/lib/types";
import { createRequest } from "@/lib/actions/panel";
import { Checkbox, Field, FormMessage, Select, SubmitButton, TextArea } from "@/components/ui/Form";
import { SpecialtyIcon } from "@/components/site/SpecialtyIcon";
import { LawyerPortrait } from "@/components/site/LawyerCard";
import { reducedMotion } from "@/components/motion/MotionProvider";

const STEPS = ["Especialidad", "Abogado", "Confirmar", "Tu caso"];

interface Props {
  specialties: Specialty[];
  lawyers: LawyerWithRelations[];
  firms: Firm[];
  initialSpecialty?: string;
  initialLawyer?: string;
}

export function RequestWizard({ specialties, lawyers, firms, initialSpecialty, initialLawyer }: Props) {
  const startSpec = specialties.find((s) => s.slug === initialSpecialty);
  const startLawyer = lawyers.find((l) => l.id === initialLawyer && (!startSpec || l.specialties.some((s) => s.slug === startSpec.slug)));
  const [spec, setSpec] = useState<Specialty | undefined>(startSpec);
  const [lawyerId, setLawyerId] = useState<string | "firma" | undefined>(startLawyer?.id);
  const [step, setStep] = useState(startSpec ? (startLawyer ? 2 : 1) : 0);
  const { state, isPending, formProps } = useFormAction(createRequest);
  const stage = useRef<HTMLDivElement>(null);

  const candidates = useMemo(() => (spec ? lawyers.filter((l) => l.specialties.some((s) => s.slug === spec.slug)) : []), [spec, lawyers]);
  const lawyer = lawyers.find((l) => l.id === lawyerId);
  const e = state.errors ?? {};

  // Cada paso entra deslizándose.
  useEffect(() => {
    const el = stage.current;
    if (!el || reducedMotion()) return;
    gsap.fromTo(el.children, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.04 });
    el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, [step]);

  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div>
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Pasos">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div className={`h-1 transition-colors duration-500 ${i <= step ? "bg-mist" : "bg-graphite"}`} />
            <span className={`mt-2 hidden text-[14px] sm:block ${i === step ? "text-ink" : "text-ink-soft"}`}>{label}</span>
          </li>
        ))}
      </ol>

      <div ref={stage} key={step}>
        {step === 0 ? (
          <>
            <h2 tabIndex={-1} className="mb-6 text-[22px] font-semibold outline-none">¿Qué especialidad necesitas?</h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {specialties.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setSpec(s);
                      setLawyerId(undefined);
                      go(1);
                    }}
                    className={`flex h-full w-full flex-col gap-3 p-5 text-left transition-colors ${spec?.slug === s.slug ? "bg-navy" : "bg-graphite hover:bg-navy"}`}
                  >
                    <SpecialtyIcon name={s.icon} size={26} className="text-mist" />
                    <span className="text-[18px] font-semibold">{s.name}</span>
                    <span className="text-[15px] text-ink-soft">{s.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === 1 && spec ? (
          <>
            <h2 tabIndex={-1} className="mb-2 text-[22px] font-semibold outline-none">Abogados de {spec.short_name.toLowerCase()}</h2>
            <p className="mb-6 text-[15px] text-ink-soft">Revisa los perfiles y elige con quién prefieres trabajar, o deja que la firma asigne.</p>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {candidates.map((l) => (
                <li key={l.id} className="flex flex-col bg-graphite">
                  <div className="group">
                    <LawyerPortrait lawyer={l} sizes="(min-width:1280px) 22vw, 45vw" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="text-[18px] font-semibold">{l.full_name}</p>
                    <p className="text-[14px] text-ink-soft">{l.title}{l.firm ? ` · ${l.firm.name}` : ""}</p>
                    <p className="line-clamp-3 text-[15px] text-ink-soft">{l.bio}</p>
                    <p className="mt-1 text-[14px] text-mist">{l.accepts_consultations ? l.availability : "Sin cupo para nuevas consultas"}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <button
                        type="button"
                        disabled={!l.accepts_consultations}
                        onClick={() => {
                          setLawyerId(l.id);
                          go(2);
                        }}
                        className="btn btn-primary"
                      >
                        Elegir
                      </button>
                      <Link href={`/abogados/${l.id}`} target="_blank" className="btn btn-ghost">
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
              <li className="flex flex-col justify-between gap-4 bg-navy p-5">
                <div>
                  <p className="text-[18px] font-semibold">Que la firma asigne</p>
                  <p className="mt-1 text-[15px] text-ink-soft">
                    {candidates.length ? "El equipo elegirá al profesional más adecuado para tu caso." : "Aún no hay perfiles publicados en esta área: la firma asignará tu caso."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLawyerId("firma");
                    go(2);
                  }}
                  className="btn btn-primary self-start"
                >
                  Continuar
                </button>
              </li>
            </ul>
            <button type="button" onClick={() => go(0)} className="btn btn-ghost mt-8">
              <ArrowLeft aria-hidden size={18} /> Cambiar especialidad
            </button>
          </>
        ) : null}

        {step === 2 && spec ? (
          <>
            <h2 tabIndex={-1} className="mb-6 text-[22px] font-semibold outline-none">Confirma tu elección</h2>
            <div className="grid gap-6 bg-graphite p-6 md:grid-cols-[200px_1fr]">
              {lawyer ? (
                <div className="group">
                  <LawyerPortrait lawyer={lawyer} sizes="200px" />
                </div>
              ) : null}
              <dl className="grid content-start gap-4 text-[16px]">
                <div>
                  <dt className="text-[14px] text-ink-soft">Especialidad</dt>
                  <dd>{spec.name}</dd>
                </div>
                <div>
                  <dt className="text-[14px] text-ink-soft">Profesional</dt>
                  <dd>{lawyer ? `${lawyer.full_name} — ${lawyer.title}` : "Asignación por la firma"}</dd>
                </div>
                {lawyer?.firm ? (
                  <div>
                    <dt className="text-[14px] text-ink-soft">Firma</dt>
                    <dd>{lawyer.firm.name}</dd>
                  </div>
                ) : null}
                {lawyer?.experience ? (
                  <div>
                    <dt className="text-[14px] text-ink-soft">Experiencia</dt>
                    <dd className="line-clamp-4 text-ink-soft">{lawyer.experience}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <p className="mt-6 max-w-[64ch] bg-navy p-4 text-[15px]">
              Elegir un abogado o una firma no representa una contratación ni crea una relación abogado-cliente. La
              firma revisará tu solicitud y te contactará; la relación empieza solo si apruebas una propuesta de servicios.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(3)} className="btn btn-primary">
                Continuar <Check aria-hidden size={18} />
              </button>
              <button type="button" onClick={() => go(1)} className="btn btn-ghost">
                <ArrowLeft aria-hidden size={18} /> Cambiar abogado
              </button>
            </div>
          </>
        ) : null}

        {step === 3 && spec ? (
          <form {...formProps} noValidate className="grid max-w-[720px] gap-5">
            <h2 tabIndex={-1} className="text-[22px] font-semibold outline-none">Cuéntanos tu caso</h2>
            <p className="-mt-2 text-[15px] text-ink-soft">
              {spec.name} · {lawyer ? lawyer.full_name : "Asignación por la firma"}
            </p>
            <input type="hidden" name="specialty_id" value={spec.id} />
            <input type="hidden" name="lawyer_id" value={lawyer?.id ?? ""} />
            {!lawyer && firms.length > 1 ? (
              <Select label="Firma de preferencia (opcional)" name="firm_id" defaultValue="" error={e.firm_id}>
                <option value="">Sin preferencia</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
            ) : (
              <input type="hidden" name="firm_id" value={lawyer?.firm_id ?? ""} />
            )}
            <Field label="Asunto" name="subject" required maxLength={140} placeholder="Ej.: Fotomulta que no me notificaron" error={e.subject} />
            <TextArea
              label="Descripción breve del caso"
              name="description"
              required
              maxLength={4000}
              rows={7}
              placeholder="Qué pasó, cuándo y qué esperas lograr. No incluyas contraseñas ni números de tarjetas."
              error={e.description}
            />
            <Select label="¿Cómo prefieres que te contactemos?" name="preferred_contact" defaultValue="whatsapp" error={e.preferred_contact}>
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada</option>
              <option value="correo">Correo electrónico</option>
            </Select>
            <Checkbox name="no_relationship_ack" error={e.no_relationship_ack}>
              Entiendo que enviar esta solicitud no constituye contratación ni crea una relación abogado-cliente.
            </Checkbox>
            <Checkbox name="data_consent" error={e.data_consent}>
              Autorizo el tratamiento de mis datos personales, incluidos los datos sensibles que describa, para la
              atención de esta solicitud, según la{" "}
              <Link href="/legal/tratamiento-datos" target="_blank" className="link text-ink">política de tratamiento de datos</Link>.
            </Checkbox>
            {e.specialty_id || e.lawyer_id ? <p role="alert" className="text-danger">{e.specialty_id || e.lawyer_id}</p> : null}
            <FormMessage state={state} />
            <div className="flex flex-wrap gap-3">
              <SubmitButton busy={isPending} pending="Enviando solicitud…">Enviar solicitud</SubmitButton>
              <button type="button" onClick={() => go(2)} className="btn btn-ghost">
                <ArrowLeft aria-hidden size={18} /> Atrás
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
