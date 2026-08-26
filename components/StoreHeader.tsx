"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { StoreSettings } from "@/lib/catalog";

const nav = [
  { label: "Inicio", href: "/" },
  { label: "Softball", href: "/#productos" },
  { label: "Pelotas", href: "/#productos" },
  { label: "Mayoristas", href: "/#mayor" },
  { label: "Pagos y envíos", href: "/#confianza" },
];

export default function StoreHeader({
  settings,
}: {
  settings: StoreSettings;
}) {
  const [open, setOpen] = useState(false);
  const whatsappHref = `https://wa.me/${settings.whatsappPhone}`;

  return (
    <>
      {settings.announcementEnabled && (
        <div className="relative z-50 bg-neutral-950 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white sm:text-[11px]">
          {settings.announcementLink ? (
            <Link href={settings.announcementLink} className="transition hover:text-emerald-400">
              {settings.announcementText}
            </Link>
          ) : (
            settings.announcementText
          )}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 lg:px-8">
          <Link href="/" className="relative h-11 w-[122px] shrink-0 sm:w-[142px]" aria-label="LCDS Sports">
            <Image
              src="/brand/lcds-logo.png"
              alt="LCDS Sports"
              fill
              priority
              sizes="142px"
              className="object-contain object-left"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative py-2 text-sm font-bold text-neutral-700 transition hover:text-neutral-950 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-500 after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden min-w-[270px] max-w-sm flex-1 items-center rounded-full border border-neutral-200 bg-neutral-50 px-4 lg:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-neutral-500" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Buscar productos..."
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center justify-center rounded-full bg-emerald-500 px-4 text-xs font-black text-neutral-950 transition hover:bg-emerald-400 sm:flex"
          >
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white p-5 shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="relative h-12 w-32">
              <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="128px" className="object-contain object-left" />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100"
              aria-label="Cerrar menú"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-7 flex items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-4">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-neutral-500" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Buscar productos..." className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base outline-none" />
          </div>

          <nav className="mt-6 divide-y divide-neutral-100">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-between text-base font-black"
              >
                {item.label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>

          <div className="mt-7 rounded-2xl bg-neutral-950 p-5 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">Atención directa</p>
            <p className="mt-2 text-sm text-neutral-300">{settings.locationText}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-neutral-950"
            >
              Comprar por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
