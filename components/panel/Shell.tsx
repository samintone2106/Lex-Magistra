"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Monogram } from "@/components/site/Monogram";
import { signOut } from "@/lib/actions/auth";

export interface ShellLink {
  href: string;
  label: string;
  exact?: boolean;
}

/** Marco común del panel de cliente y del admin: barra lateral en desktop, cajón en móvil. */
export function Shell({
  title,
  firmName,
  userName,
  links,
  extra,
  children,
}: {
  title: string;
  firmName: string;
  userName: string;
  links: ShellLink[];
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (l: ShellLink) => (l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`));

  const nav = (
    <nav aria-label={title} className="flex flex-1 flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          aria-current={active(l) ? "page" : undefined}
          className={`flex min-h-11 items-center px-3 text-[15px] transition-colors ${
            active(l) ? "bg-navy text-ink" : "text-ink-soft hover:bg-graphite hover:text-ink"
          }`}
        >
          {l.label}
        </Link>
      ))}
      {extra}
    </nav>
  );

  return (
    <div className="min-h-[100svh] bg-carbon lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col gap-8 bg-[var(--graphite)] p-5 lg:sticky lg:top-0 lg:flex lg:h-[100svh]">
        <Link href="/" className="flex items-center gap-3">
          <Monogram className="h-7 w-7" />
          <span className="text-[15px] font-semibold">{firmName}</span>
        </Link>
        <p className="text-[13px] text-ink-soft">{title}</p>
        {nav}
        <div className="space-y-2">
          <p className="truncate text-[14px] text-ink-soft">{userName}</p>
          <form action={signOut}>
            <button type="submit" className="btn btn-secondary w-full">
              <LogOut aria-hidden size={16} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[var(--graphite)] px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Monogram className="h-7 w-7" />
          <span className="text-[15px] font-semibold">{firmName}</span>
        </Link>
        <button type="button" className="btn btn-ghost" aria-expanded={open} aria-controls="panel-nav" onClick={() => setOpen((v) => !v)}>
          {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />} {open ? "Cerrar" : "Menú"}
        </button>
      </header>
      {open ? (
        <div id="panel-nav" className="fixed inset-x-0 bottom-0 top-16 z-20 flex flex-col gap-6 overflow-y-auto bg-[var(--graphite)] p-4 lg:hidden">
          {nav}
          <form action={signOut}>
            <button type="submit" className="btn btn-secondary w-full">
              <LogOut aria-hidden size={16} /> Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}

      <main id="contenido" className="page-enter min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        {children}
      </main>
    </div>
  );
}

export function PanelTitle({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-[clamp(36px,4vw,56px)]">{title}</h1>
        {lead ? <p className="mt-2 max-w-[60ch] text-[16px] text-ink-soft">{lead}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
