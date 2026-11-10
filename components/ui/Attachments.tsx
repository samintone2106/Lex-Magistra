"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, ExternalLink, FileText, Loader2, Paperclip, X } from "lucide-react";
import { Hint, Label } from "@/components/ui/Form";
import { Notice } from "@/components/ui/States";
import { addRequestAttachments, getAttachmentUrl, removeRequestAttachment } from "@/lib/actions/uploads";
import { ATTACHMENT_MAX, ATTACHMENTS_PER_REQUEST, DOC_MIMES, initialState } from "@/lib/validation";
import type { AttachmentView } from "@/lib/types";

const DOC_ACCEPT: readonly string[] = DOC_MIMES;
const DOC_MAX = ATTACHMENT_MAX;
const MAX_ATTACHMENTS = ATTACHMENTS_PER_REQUEST;

const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${nf.format(Math.max(1, Math.round(n / 1024)))} KB`;
  return `${nf.format(n / (1024 * 1024))} MB`;
}
const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

/* ───────── Entrega de archivos del asistente a la ficha de la solicitud ─────────
 * La solicitud se crea primero (la acción redirige a su ficha) y los archivos elegidos en el
 * asistente se suben allí. Se guardan en memoria del navegador durante esa navegación. */
let pendingFiles: File[] = [];
export function stashPendingFiles(files: File[]) {
  pendingFiles = files;
}
function takePendingFiles() {
  const f = pendingFiles;
  pendingFiles = [];
  return f;
}

/* ───────── Selector de documentos (controlado) ───────── */
export function DocPicker({
  label,
  hint,
  files,
  onChange,
  max,
  disabled,
}: {
  label: string;
  hint?: React.ReactNode;
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
  disabled?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");

  function add(list: FileList | null | undefined) {
    if (!list?.length) return;
    const next = [...files];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      if (!DOC_ACCEPT.includes(f.type)) problems.push(`${f.name}: usa JPG, PNG, WEBP o PDF.`);
      else if (f.size > DOC_MAX) problems.push(`${f.name}: supera 10 MB.`);
      else if (next.length >= max) problems.push(`${f.name}: ya llegaste al máximo de ${max}.`);
      else if (!next.some((n) => n.name === f.name && n.size === f.size)) next.push(f);
    }
    setError(problems.join(" "));
    onChange(next);
    if (input.current) input.current.value = "";
  }

  const full = files.length >= max;
  return (
    <div>
      <Label as="span">
        <span id={`${uid}-label`}>{label}</span>
      </Label>
      <input
        ref={input}
        type="file"
        multiple
        accept={DOC_ACCEPT.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => add(e.target.files)}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !full) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled && !full) add(e.dataTransfer.files);
        }}
      >
        <button
          type="button"
          disabled={disabled || full}
          onClick={() => input.current?.click()}
          aria-labelledby={`${uid}-label ${uid}-btn`}
          aria-describedby={[hint ? `${uid}-hint` : null, `${uid}-err`].filter(Boolean).join(" ")}
          className={`flex min-h-24 w-full flex-col items-center justify-center gap-1.5 border border-dashed px-4 py-4 text-center text-[14px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
            over ? "border-mist bg-navy" : "border-white/[0.18] hover:border-mist hover:bg-white/[0.03]"
          }`}
        >
          <Paperclip aria-hidden size={20} className="text-mist" />
          <span id={`${uid}-btn`} className="font-medium">
            {full ? `Máximo ${max} documentos` : "Elegir archivos"}
          </span>
          <span className="text-[13px] text-ink-soft">{full ? "Quita uno para cambiarlo" : "o arrástralos hasta aquí"}</span>
        </button>
      </div>
      <Hint id={`${uid}-hint`}>{hint}</Hint>
      <p id={`${uid}-err`} role="alert" className={`mt-1.5 text-[14px] text-danger ${error ? "" : "sr-only"}`}>
        {error}
      </p>
      {files.length ? (
        <ul className="mt-3 grid gap-px bg-white/[0.06]" aria-label="Archivos elegidos">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="flex min-h-12 items-center gap-3 bg-graphite px-3 py-2">
              <FileIcon mime={f.type} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px]">{f.name}</span>
                <span className="block text-[12px] text-ink-soft">{formatBytes(f.size)}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, k) => k !== i))}
                className="btn btn-ghost min-h-10 px-2 text-[14px]"
                aria-label={`Quitar ${f.name}`}
              >
                <X aria-hidden size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FileIcon({ mime }: { mime: string }) {
  return (
    <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center bg-navy text-mist">
      {mime === "application/pdf" ? <FileText size={18} strokeWidth={1.6} /> : <Paperclip size={18} strokeWidth={1.6} />}
    </span>
  );
}

/* ───────── Lista de adjuntos ───────── */
export function AttachmentList({ items, canRemove }: { items: AttachmentView[]; canRemove: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function openFile(a: AttachmentView) {
    setError("");
    setBusy(a.id);
    // La pestaña se abre en el mismo clic para que el navegador no la bloquee.
    const tab = window.open("", "_blank");
    const res = await getAttachmentUrl(a.id);
    setBusy(null);
    if (res.ok && res.url) {
      if (tab) {
        tab.opener = null;
        tab.location.href = res.url;
      } else window.location.assign(res.url);
    } else {
      tab?.close();
      setError(res.message ?? "No pudimos abrir el documento.");
    }
  }

  async function remove(a: AttachmentView) {
    setError("");
    setBusy(a.id);
    const res = await removeRequestAttachment(a.id);
    setBusy(null);
    setArmed(null);
    if (!res.ok) setError(res.message ?? "No pudimos quitar el documento.");
  }

  if (!items.length) return null;
  return (
    <div className="grid gap-3">
      <ul className="grid gap-px bg-white/[0.06]">
        {items.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 bg-graphite px-3 py-2.5 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none">
            {a.thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL firmada de corta duración, no pasa por el optimizador
              <img src={a.thumbUrl} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0 bg-navy object-cover" />
            ) : (
              <FileIcon mime={a.mime} />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px]">{a.name}</span>
              <span className="block text-[12px] text-ink-soft">
                {a.mime === "application/pdf" ? "PDF" : "Imagen"} · {formatBytes(a.size)} · {dateFmt.format(new Date(a.created_at))}
              </span>
            </span>
            {armed === a.id ? (
              <span role="group" aria-label="Confirmar" className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-ink-soft">¿Quitar este documento?</span>
                <button type="button" disabled={busy === a.id} onClick={() => void remove(a)} className="btn min-h-10 bg-danger-bg px-3 text-[14px] text-ink hover:bg-danger hover:text-carbon">
                  {busy === a.id ? "Quitando…" : "Sí, quitar"}
                </button>
                <button type="button" onClick={() => setArmed(null)} className="btn btn-ghost min-h-10 text-[14px]">
                  No
                </button>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <button type="button" disabled={busy === a.id} onClick={() => void openFile(a)} className="btn btn-ghost min-h-10 gap-1.5 text-[14px]">
                  {busy === a.id ? <Loader2 aria-hidden size={15} className="animate-spin motion-reduce:animate-none" /> : <ExternalLink aria-hidden size={15} />}
                  Abrir<span className="sr-only"> {a.name} (se abre en una pestaña nueva)</span>
                </button>
                {canRemove ? (
                  <button type="button" onClick={() => setArmed(a.id)} className="btn btn-ghost min-h-10 text-[14px] text-danger hover:text-ink">
                    Quitar<span className="sr-only"> {a.name}</span>
                  </button>
                ) : null}
              </span>
            )}
          </li>
        ))}
      </ul>
      {error ? (
        <Notice tone="danger" role="alert">
          {error}
        </Notice>
      ) : null}
    </div>
  );
}

/* ───────── Subida a una solicitud existente ───────── */
type Row = { file: File; state: "wait" | "up" | "ok" | "err"; error?: string };

export function AttachmentUploader({ requestId, existing, fromWizard = false }: { requestId: string; existing: number; fromWizard?: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<{ ok: boolean; text: string } | null>(null);
  const started = useRef(false);
  const remaining = Math.max(0, MAX_ATTACHMENTS - existing);
  const uploading = rows.some((r) => r.state === "wait" || r.state === "up");

  async function upload(list: File[]) {
    if (!list.length) return;
    setSummary(null);
    const next: Row[] = list.map((file) => ({ file, state: "wait" }));
    setRows(next);
    let ok = 0;
    // Uno por envío: el progreso es visible y cada archivo respeta el límite de tamaño de la acción.
    for (let i = 0; i < next.length; i++) {
      setRows((r) => r.map((x, k) => (k === i ? { ...x, state: "up" } : x)));
      const fd = new FormData();
      fd.set("request_id", requestId);
      fd.append("files", next[i].file);
      let res;
      try {
        res = await addRequestAttachments(initialState, fd);
      } catch {
        res = { ok: false, message: "Se perdió la conexión." };
      }
      if (res.ok) ok++;
      setRows((r) => r.map((x, k) => (k === i ? { ...x, state: res.ok ? "ok" : "err", error: res.ok ? undefined : res.message } : x)));
    }
    setFiles([]);
    // Los que se subieron ya aparecen en la lista de adjuntos; aquí solo quedan los que fallaron.
    setRows((r) => r.filter((x) => x.state === "err"));
    setSummary(
      ok === next.length
        ? { ok: true, text: ok === 1 ? "Documento adjuntado." : `${ok} documentos adjuntados.` }
        : { ok: false, text: `Se adjuntaron ${ok} de ${next.length}. Revisa los que fallaron e inténtalo otra vez.` },
    );
  }

  // Archivos elegidos en el asistente de nueva solicitud: se suben al llegar a la ficha.
  useEffect(() => {
    if (!fromWizard || started.current) return;
    started.current = true;
    const pending = takePendingFiles().slice(0, remaining);
    if (pending.length) void upload(pending);
    // Solo al montar: la lista pendiente se consume una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-4">
      {remaining > 0 && !uploading ? (
        <>
          <DocPicker
            label="Agregar documentos"
            files={files}
            onChange={setFiles}
            max={remaining}
            hint={`Imágenes o PDF de hasta 10 MB. ${remaining === MAX_ATTACHMENTS ? `Hasta ${MAX_ATTACHMENTS} por solicitud.` : `Te quedan ${remaining}.`}`}
          />
          {files.length ? (
            <div>
              <button type="button" className="btn btn-primary" onClick={() => void upload(files)}>
                {files.length === 1 ? "Adjuntar documento" : `Adjuntar ${files.length} documentos`}
              </button>
            </div>
          ) : null}
        </>
      ) : remaining === 0 ? (
        <p className="text-[14px] text-ink-soft">Llegaste al máximo de {MAX_ATTACHMENTS} documentos. Quita uno si necesitas cambiarlo.</p>
      ) : null}

      {rows.length ? (
        <div aria-live="polite">
          {uploading ? (
            <p className="mb-2 text-[14px] text-ink-soft">
              Subiendo {Math.min(rows.filter((r) => r.state === "ok" || r.state === "err").length + 1, rows.length)} de {rows.length}…
            </p>
          ) : null}
          <ul className="grid gap-px bg-white/[0.06]">
            {rows.map((r, i) => (
              <li key={i} className="flex min-h-11 items-center gap-3 bg-graphite px-3 py-2 text-[14px]">
                {r.state === "up" || r.state === "wait" ? (
                  <Loader2 aria-hidden size={16} className={`shrink-0 text-ink-soft ${r.state === "up" ? "animate-spin motion-reduce:animate-none" : "opacity-40"}`} />
                ) : r.state === "ok" ? (
                  <CheckCircle2 aria-hidden size={16} className="shrink-0 text-mist" />
                ) : (
                  <CircleAlert aria-hidden size={16} className="shrink-0 text-danger" />
                )}
                <span className="min-w-0 flex-1 truncate">{r.file.name}</span>
                <span className={`shrink-0 text-[13px] ${r.state === "err" ? "text-danger" : "text-ink-soft"}`}>
                  {r.state === "wait" ? "En cola" : r.state === "up" ? "Subiendo…" : r.state === "ok" ? "Listo" : (r.error ?? "Falló")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {summary ? <Notice tone={summary.ok ? "success" : "danger"}>{summary.text}</Notice> : null}
    </div>
  );
}
