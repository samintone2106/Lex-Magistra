"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  ChartColumn,
  FilePlus2,
  FileText,
  Inbox,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Scale,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Monogram } from "@/components/site/Monogram";
import { initialsOf } from "@/components/ui/Panel";
import { signOut } from "@/lib/actions/auth";
import { isOwnPublicUrl } from "@/lib/storage-url";

const ICONS = {
  home: LayoutGrid,
  stats: ChartColumn,
  new: FilePlus2,
  requests: FileText,
  lawyers: Scale,
  reviews: MessageSquareQuote,
  profile: UserRound,
  assigned: Briefcase,
  admin: ShieldCheck,
  firms: Building2,
  users: Users,
  messages: Mail,
  settings: Settings,
  inbox: Inbox,
  back: ArrowLeft,
} satisfies Record<string, LucideIcon>;

export type ShellIcon = keyof typeof ICONS;

export interface ShellLink {
  href: string;
  label: string;
  icon: ShellIcon;
  exact?: boolean;
  /** Solo en colas que piden acción (solicitudes abiertas, reseñas por moderar). */
  count?: number;
  countLabel?: string;
}

export interface ShellGroup {
  label?: string;
  links: ShellLink[];
}

/**
 * Marco común del panel de cliente y del admin (T con reglas finas): barra lateral de 240px y barra
 * superior de 64px sobre el mismo suelo; en móvil, barra de 56px y menú a pantalla completa.
 */
export function Shell({
  scope,
  firmName,
  user,
  groups,
  extra,
  children,
}: {
  scope: string;
  firmName: string;
  user: { name: string; email: string; role: string; avatarUrl?: string | null };
  groups: ShellGroup[];
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const all = groups.flatMap((g) => g.links);
  const isActive = (l: ShellLink) => (l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`));
  // La ruta más específica gana (p. ej. /admin/solicitudes frente a /admin).
  const current = all.filter(isActive).sort((a, b) => b.href.length - a.href.length)[0];

  // Cerrar con Escape, bloquear el scroll del fondo y devolver el foco al botón.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const btn = menuBtn.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  const nav = (idPrefix: string) => (
    <nav aria-label={scope} className="flex flex-col gap-6">
      {groups.map((g, gi) => (
        <div key={g.label ?? gi}>
          {g.label ? (
            <p id={`${idPrefix}-g${gi}`} className="mb-2 px-3 text-[12px] text-ink-soft">
              {g.label}
            </p>
          ) : null}
          <ul className="flex flex-col gap-0.5" aria-labelledby={g.label ? `${idPrefix}-g${gi}` : undefined}>
            {g.links.map((l) => {
              const Icon = ICONS[l.icon];
              const on = current?.href === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={on ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-3 px-3 text-[15px] transition-colors duration-150 lg:min-h-9 lg:text-[14px] ${
                      on ? "bg-white/[0.06] font-medium text-ink" : "text-ink-soft hover:bg-white/[0.03] hover:text-ink"
                    }`}
                  >
                    <Icon aria-hidden size={16} strokeWidth={1.6} className={on ? "text-ink" : "text-ink-soft group-hover:text-ink"} />
                    <span className="min-w-0 flex-1 truncate">{l.label}</span>
                    {l.count ? (
                      <span className="tabular-nums text-[12px] font-medium text-ink" aria-label={`${l.count} ${l.countLabel ?? "pendientes"}`}>
                        {l.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {extra}
    </nav>
  );

  const userRow = (
    <div className="flex items-center gap-3">
      {isOwnPublicUrl(user.avatarUrl, "avatars") ? (
        <Image src={user.avatarUrl} alt="" width={36} height={36} sizes="36px" className="h-9 w-9 shrink-0 bg-navy object-cover" />
      ) : (
        <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center bg-navy text-[13px] font-medium text-mist">
          {initialsOf(user.name)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium">{user.name}</p>
        <p className="truncate text-[12px] text-ink-soft">
          {user.role} · {user.email}
        </p>
      </div>
    </div>
  );

  const signOutBtn = (
    <form action={signOut}>
      <button type="submit" className="btn btn-ghost min-h-10 w-full justify-start gap-3 px-3 text-[14px] text-ink-soft hover:text-ink">
        <LogOut aria-hidden size={16} strokeWidth={1.6} /> Cerrar sesión
      </button>
    </form>
  );

  return (
    <div className="min-h-[100svh] bg-carbon lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-mist focus:px-4 focus:py-2 focus:text-navy">
        Saltar al contenido
      </a>

      {/* Barra lateral de escritorio */}
      <aside className="hidden border-r border-white/[0.07] lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col">
        <Link href="/" className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5" aria-label={`${firmName}, ir al sitio`}>
          <Monogram className="h-7 w-7 text-mist" />
          <span className="truncate text-[15px] font-semibold">{firmName}</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-2 py-5">{nav("side")}</div>
        <div className="space-y-2 border-t border-white/[0.07] p-4">
          {userRow}
          {signOutBtn}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior: dónde estás y quién eres */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-carbon px-4 sm:px-6 lg:h-16 lg:px-8">
          <Link href="/" className="flex items-center lg:hidden" aria-label={`${firmName}, ir al sitio`}>
            <Monogram className="h-7 w-7 text-mist" />
          </Link>
          <p className="min-w-0 flex-1 truncate text-[14px]">
            <span className="text-ink-soft">{scope}</span>
            {current ? (
              <>
                <span aria-hidden className="mx-2 text-ink-soft">/</span>
                <span className="text-ink">{current.label}</span>
              </>
            ) : null}
          </p>
          <Link href="/" className="hidden items-center gap-1.5 text-[14px] text-ink-soft hover:text-ink sm:inline-flex">
            Ver sitio <ArrowUpRight aria-hidden size={14} />
          </Link>
          <button
            ref={menuBtn}
            type="button"
            className="btn btn-ghost -mr-2 min-h-11 gap-2 px-2 text-[15px] lg:hidden"
            aria-expanded={open}
            aria-controls="panel-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />} {open ? "Cerrar" : "Menú"}
          </button>
        </header>

        {/* Menú móvil a pantalla completa */}
        {open ? (
          <div
            id="panel-nav"
            ref={sheet}
            className="fixed inset-x-0 bottom-0 top-14 z-20 flex flex-col overflow-y-auto bg-carbon px-2 pb-6 pt-4 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] starting:-translate-y-2 starting:opacity-0 motion-reduce:transition-none lg:hidden"
          >
            <div className="flex-1">{nav("sheet")}</div>
            <div className="mt-8 space-y-2 border-t border-white/[0.07] px-3 pt-4">
              {userRow}
              {signOutBtn}
            </div>
          </div>
        ) : null}

        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Fila de título de cada pantalla: h1 sustantivo, una línea de contexto y las acciones reales. */
export function PanelTitle({
  title,
  lead,
  back,
  children,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="mb-3 inline-flex min-h-9 items-center gap-1.5 text-[14px] text-ink-soft hover:text-ink">
            <ArrowLeft aria-hidden size={15} /> {back.label}
          </Link>
        ) : null}
        <h1 className="font-display break-words text-[30px] leading-[1.05] sm:text-[34px]">{title}</h1>
        {lead ? <p className="mt-2 max-w-[68ch] text-[15px] text-ink-soft">{lead}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
