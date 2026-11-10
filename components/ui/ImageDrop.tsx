"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ImageUp, Loader2, Move, RotateCcw } from "lucide-react";
import { FieldError, Hint, Label } from "@/components/ui/Form";
import { initialState, type ActionState } from "@/lib/validation";

/** Tamaño máximo del lado largo de la imagen final. */
const MAX_SIDE = 1200;
/** Tope de la imagen original antes de recortarla (fotos de celular). */
const RAW_MAX = 25 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

type Status = "idle" | "editing" | "processing" | "uploading" | "done" | "error";
interface Pos {
  x: number;
  y: number;
}

interface Props {
  label: string;
  hint?: React.ReactNode;
  /** Proporción ancho/alto del recorte: 1 (cuadrado) o 4/5 (retrato). */
  aspect: 1 | 0.8;
  /** Imagen actual (URL pública) o null. */
  currentUrl?: string | null;
  /** Qué mostrar cuando no hay imagen (iniciales, texto). */
  fallback?: React.ReactNode;
  /** Ancho en px de la vista previa y del recorte. */
  width?: number;
  /** Tamaño máximo del archivo final (lo valida también el servidor). */
  maxBytes: number;
  /** Modo formulario: la imagen recortada viaja en este campo del formulario padre. */
  name?: string;
  /** Modo independiente: al confirmar el recorte se sube con esta Server Action (campo `file`). */
  action?: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  /** Error que viene del formulario padre. */
  error?: string;
  id?: string;
  /** "stack": vista previa encima del botón (columnas angostas). */
  layout?: "row" | "stack";
  /** Vista previa en escala de grises, como se ve en el sitio público. */
  grayscale?: boolean;
}

/**
 * Selector de imagen con arrastrar y soltar, clic o teclado. Recorta en el navegador
 * (centrado, con arrastre o flechas para reencuadrar), reduce a 1200 px y exporta WEBP.
 */
export function ImageDrop({ label, hint, aspect, currentUrl, fallback, width = 200, maxBytes, name, action, error, id, layout = "row", grayscale = false }: Props) {
  const uid = useId();
  const fid = id ?? `img-${uid.replace(/:/g, "")}`;
  const picker = useRef<HTMLInputElement>(null);
  const carrier = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const imgEl = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; pos: Pos } | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [over, setOver] = useState(false);
  const [raw, setRaw] = useState<{ url: string; w: number; h: number } | null>(null);
  const [pos, setPos] = useState<Pos>({ x: 0.5, y: 0.5 });
  const [frameW, setFrameW] = useState(width);
  const [result, setResult] = useState<string | null>(null);

  // Libera las URLs temporales.
  useEffect(() => () => void (raw && URL.revokeObjectURL(raw.url)), [raw]);
  useEffect(() => () => void (result && URL.revokeObjectURL(result)), [result]);

  // El recorte se calcula sobre el ancho real del marco (puede encogerse en móvil).
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFrameW(e.contentRect.width || width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [raw, width]);

  // Recorte "cover": rectángulo del original que llena el marco, desplazable en un solo eje.
  const crop = raw
    ? (() => {
        const cw = raw.w / raw.h > aspect ? raw.h * aspect : raw.w;
        const ch = cw / aspect;
        const maxX = raw.w - cw;
        const maxY = raw.h - ch;
        return { cw, ch, maxX, maxY, sx: pos.x * maxX, sy: pos.y * maxY };
      })()
    : null;
  const scale = crop ? frameW / crop.cw : 1;
  const movable = !!crop && (crop.maxX > 1 || crop.maxY > 1);

  const fail = (msg: string) => {
    setStatus("error");
    setMessage(msg);
  };

  async function open(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return fail("Ese archivo no es una imagen JPG, PNG o WEBP.");
    if (file.size > RAW_MAX) return fail("La imagen supera 25 MB. Elige una más liviana.");
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;
    try {
      await img.decode();
    } catch {
      URL.revokeObjectURL(url);
      return fail("No pudimos leer la imagen. Prueba con otra.");
    }
    imgEl.current = img;
    setRaw({ url, w: img.naturalWidth, h: img.naturalHeight });
    setPos({ x: 0.5, y: 0.5 });
    setStatus("editing");
    setMessage("");
  }

  function reset() {
    setRaw(null);
    imgEl.current = null;
    setStatus("idle");
    setMessage("");
    if (picker.current) picker.current.value = "";
  }

  /** Dibuja el recorte en un canvas y lo exporta (WEBP; PNG si el navegador no sabe WEBP). */
  async function render(): Promise<File | null> {
    const img = imgEl.current;
    if (!img || !crop) return null;
    const k = Math.min(1, MAX_SIDE / Math.max(crop.cw, crop.ch));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(crop.cw * k);
    canvas.height = Math.round(crop.ch * k);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, crop.sx, crop.sy, crop.cw, crop.ch, 0, 0, canvas.width, canvas.height);
    for (const q of [0.86, 0.72, 0.6]) {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", q));
      if (!blob) return null;
      if (blob.size <= maxBytes) {
        const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png";
        return new File([blob], `foto.${ext}`, { type: blob.type });
      }
    }
    return null;
  }

  async function confirm() {
    setStatus("processing");
    const file = await render();
    if (!file) return fail("No pudimos preparar la imagen. Prueba con otra más pequeña.");
    const preview = URL.createObjectURL(file);

    if (action) {
      setStatus("uploading");
      const fd = new FormData();
      fd.set("file", file);
      let res: ActionState;
      try {
        res = await action(initialState, fd);
      } catch {
        res = { ok: false, message: "Se perdió la conexión. Intenta de nuevo." };
      }
      if (!res.ok) {
        URL.revokeObjectURL(preview);
        return fail(res.message ?? "No pudimos subir la imagen.");
      }
      setResult(preview);
      setRaw(null);
      setStatus("done");
      setMessage(res.message ?? "Imagen actualizada.");
      return;
    }

    // Modo formulario: el archivo recortado queda en un input oculto con el nombre del campo.
    if (carrier.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      carrier.current.files = dt.files;
    }
    setResult(preview);
    setRaw(null);
    setStatus("done");
    setMessage("Lista. Se guardará con el formulario.");
  }

  function nudge(dx: number, dy: number) {
    setPos((p) => ({ x: clamp(p.x + dx), y: clamp(p.y + dy) }));
  }

  const busy = status === "processing" || status === "uploading";
  const shown = result ?? currentUrl ?? null;
  const describedBy = [hint ? `${fid}-hint` : null, `${fid}-status`, error ? `${fid}-err` : null].filter(Boolean).join(" ");
  const box = { width, maxWidth: "100%", aspectRatio: String(aspect) };

  return (
    <div>
      <Label as="span" required={false}>
        <span id={`${fid}-label`}>{label}</span>
      </Label>

      {name ? <input ref={carrier} type="file" name={name} hidden tabIndex={-1} aria-hidden /> : null}
      <input
        ref={picker}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => open(e.target.files?.[0])}
      />

      {raw && crop ? (
        <div className="transition-[opacity,transform] duration-200 ease-[var(--ease-out)] starting:scale-[0.97] starting:opacity-0 motion-reduce:transition-none">
          <div
            ref={frame}
            tabIndex={0}
            role="group"
            aria-roledescription="encuadre"
            aria-label={`Encuadre de ${label.toLowerCase()}`}
            aria-describedby={`${fid}-crop-help`}
            style={box}
            className={`relative touch-none select-none overflow-hidden bg-navy outline-offset-2 ${movable ? "cursor-grab active:cursor-grabbing" : ""}`}
            onPointerDown={(e) => {
              if (!movable || drag.current) return; // ignora un segundo dedo
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, pos };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || !crop) return;
              const nx = crop.maxX > 0 ? (d.pos.x * crop.maxX - (e.clientX - d.x) / scale) / crop.maxX : 0.5;
              const ny = crop.maxY > 0 ? (d.pos.y * crop.maxY - (e.clientY - d.y) / scale) / crop.maxY : 0.5;
              setPos({ x: clamp(nx), y: clamp(ny) });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.2 : 0.05;
              const map: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
              if (e.key in map) {
                e.preventDefault();
                nudge(...map[e.key]);
              } else if (e.key === "Home") {
                e.preventDefault();
                setPos({ x: 0.5, y: 0.5 });
              } else if (e.key === "Enter") {
                e.preventDefault();
                void confirm();
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- vista local (blob:) que se mueve con transform */}
            <img
              src={raw.url}
              alt=""
              draggable={false}
              className={`pointer-events-none absolute left-0 top-0 max-w-none ${grayscale ? "grayscale" : ""}`}
              style={{
                width: raw.w * scale,
                height: raw.h * scale,
                transform: `translate3d(${-crop.sx * scale}px, ${-crop.sy * scale}px, 0)`,
              }}
            />
            {movable ? (
              <span aria-hidden className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-carbon/80 px-2 py-1 text-[12px] text-ink">
                <Move size={13} /> Arrastra para encuadrar
              </span>
            ) : null}
          </div>
          <p id={`${fid}-crop-help`} className="mt-2 max-w-[44ch] text-[13px] text-ink-soft">
            {movable ? "Arrastra la imagen o usa las flechas del teclado para elegir qué parte se ve. Inicio la centra." : "La imagen ya llena el recorte."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary min-h-10 px-4 text-[14px]" onClick={() => void confirm()} disabled={busy} aria-busy={busy}>
              {busy ? (
                <>
                  <Loader2 aria-hidden size={16} className="animate-spin motion-reduce:animate-none" /> {status === "uploading" ? "Subiendo…" : "Preparando…"}
                </>
              ) : (
                <>
                  <Check aria-hidden size={16} /> {action ? "Guardar foto" : "Usar esta foto"}
                </>
              )}
            </button>
            {movable ? (
              <button type="button" className="btn btn-ghost min-h-10 text-[14px]" onClick={() => setPos({ x: 0.5, y: 0.5 })} disabled={busy}>
                <RotateCcw aria-hidden size={15} /> Centrar
              </button>
            ) : null}
            <button type="button" className="btn btn-ghost min-h-10 text-[14px]" onClick={reset} disabled={busy}>
              Cancelar
            </button>
          </div>
          {status === "uploading" ? (
            <div className="mt-3 h-0.5 overflow-hidden bg-white/[0.08]" style={{ width, maxWidth: "100%" }} role="progressbar" aria-label="Subiendo imagen">
              <span className="block h-full w-1/3 animate-pulse bg-mist motion-reduce:animate-none" />
            </div>
          ) : null}
        </div>
      ) : (
        <div className={layout === "stack" ? "grid gap-3" : "flex flex-wrap items-end gap-4"}>
          <div style={box} className="relative shrink-0 overflow-hidden bg-navy">
            {shown ? (
              <Image src={shown} alt={`${label}: vista actual`} fill sizes={`${width}px`} className={`object-cover ${grayscale ? "grayscale" : ""}`} unoptimized />
            ) : (
              <div className="grid h-full place-items-center px-3 text-center text-[13px] text-ink-soft">{fallback ?? "Sin imagen"}</div>
            )}
          </div>
          <div
            className={layout === "stack" ? "min-w-0" : "min-w-[200px] flex-1"}
            style={layout === "stack" ? { width, maxWidth: "100%" } : undefined}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              void open(e.dataTransfer.files?.[0]);
            }}
          >
            <button
              type="button"
              onClick={() => picker.current?.click()}
              aria-labelledby={`${fid}-label ${fid}-btn`}
              aria-describedby={describedBy}
              className={`flex min-h-24 w-full flex-col items-center justify-center gap-1.5 border border-dashed px-4 py-4 text-center text-[14px] transition-colors duration-150 ${
                over ? "border-mist bg-navy text-ink" : "border-white/[0.18] text-ink hover:border-mist hover:bg-white/[0.03]"
              }`}
            >
              <ImageUp aria-hidden size={20} className="text-mist" />
              <span id={`${fid}-btn`} className="font-medium">
                {shown ? "Cambiar imagen" : "Elegir imagen"}
              </span>
              <span className="text-[13px] text-ink-soft">o arrástrala hasta aquí</span>
            </button>
          </div>
        </div>
      )}

      <Hint id={`${fid}-hint`}>{hint}</Hint>
      <p id={`${fid}-status`} role="status" aria-live="polite" className={`mt-1.5 text-[14px] ${status === "error" ? "text-danger" : "text-ink-soft"} ${message ? "" : "sr-only"}`}>
        {message}
      </p>
      <FieldError id={`${fid}-err`} error={error} />
    </div>
  );
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));
