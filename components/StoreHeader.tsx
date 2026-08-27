"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { StoreSettings } from "@/lib/catalog";

const nav = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/#productos" },
  { label: "Softball", href: "/#categorias" },
  { label: "Mayoristas", href: "/mayoristas" },
  { label: "Envíos", href: "/#envios" },
];

export default function StoreHeader({ settings }: { settings: StoreSettings }) {
  const [open, setOpen] = useState(false);
  const whatsappHref = `https://wa.me/${settings.whatsappPhone}`;
  const announcementMessages = (settings.announcementMessages?.length ? settings.announcementMessages : [settings.announcementText])
    .map((message) => message.trim())
    .filter(Boolean);

  return (
    <>
      {settings.announcementEnabled && announcementMessages.length > 0 && (
        <div className="announcement-bar relative z-50 overflow-hidden border-b border-white/10 bg-neutral-950 text-white">
          <div className="flex h-9 items-center sm:h-10">
            <div className="relative z-20 flex h-full shrink-0 items-center gap-2 border-r border-white/10 bg-neutral-950 px-3.5 sm:px-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white sm:text-[10px]">LCDS</span>
            </div>

            <div className="relative min-w-0 flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-neutral-950 to-transparent sm:w-12" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-neutral-950 to-transparent sm:w-12" />

              {announcementMessages.length === 1 ? (
                <div className="flex h-full items-center px-5 text-[9px] font-black uppercase tracking-[0.16em] text-white/85 sm:px-7 sm:text-[10px]">
                  {settings.announcementLink ? (
                    <Link href={settings.announcementLink} className="transition hover:text-emerald-400">
                      {announcementMessages[0]}
                    </Link>
                  ) : (
                    <span>{announcementMessages[0]}</span>
                  )}
                </div>
              ) : (
                <div className="announcement-marquee-track flex w-max items-center whitespace-nowrap">
                  {[0, 1].map((copyIndex) => (
                    <div
                      key={copyIndex}
                      aria-hidden={copyIndex === 1}
                      className="flex min-w-[max(100vw,72rem)] shrink-0 items-center justify-around gap-10 px-7 sm:gap-14 sm:px-10 lg:gap-20 lg:px-14"
                    >
                      {announcementMessages.map((message, index) => {
                        const content = (
                          <span className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.15em] text-white/82 transition hover:text-white sm:text-[10px]">
                            <span className="text-emerald-400">◆</span>
                            {message}
                          </span>
                        );

                        return settings.announcementLink ? (
                          <Link key={`${copyIndex}-${index}`} href={settings.announcementLink} className="py-3">
                            {content}
                          </Link>
                        ) : (
                          <span key={`${copyIndex}-${index}`} className="py-3">{content}</span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/94 backdrop-blur-2xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 lg:h-[76px] lg:px-8">
          <Link href="/" className="relative h-10 w-[112px] shrink-0 sm:h-11 sm:w-[132px]" aria-label="LCDS Sports">
            <Image
              src="/brand/lcds-logo.png"
              alt="LCDS Sports"
              fill
              priority
              sizes="132px"
              className="object-contain object-left"
            />
          </Link>

          <div className="hidden h-7 w-px bg-neutral-200 lg:block" />

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[12px] font-extrabold text-neutral-600 transition duration-200 hover:bg-neutral-100 hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden w-full max-w-[260px] items-center rounded-full border border-neutral-200 bg-neutral-50 px-3.5 transition focus-within:border-neutral-300 focus-within:bg-white xl:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-neutral-400" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Buscar productos"
              className="h-10 min-w-0 flex-1 bg-transparent px-2.5 text-xs font-semibold outline-none placeholder:font-medium placeholder:text-neutral-400"
            />
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-10 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-[11px] font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-neutral-950 sm:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Comprar
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950 transition hover:bg-neutral-100 lg:hidden"
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
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[90%] max-w-[390px] flex-col overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="relative h-11 w-32">
              <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="128px" className="object-contain object-left" />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
              aria-label="Cerrar menú"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-5 flex items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-4 focus-within:border-emerald-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-neutral-500" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Buscar productos" className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" />
          </div>

          <nav className="mt-5 divide-y divide-neutral-100 border-y border-neutral-100">
            {nav.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-between text-[15px] font-black text-neutral-900"
              >
                <span className="flex items-center gap-3">
                  <span className="text-[9px] font-black tracking-[0.16em] text-neutral-300">0{index + 1}</span>
                  {item.label}
                </span>
                <span aria-hidden="true" className="text-emerald-600">↗</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-7">
            <div className="overflow-hidden rounded-[26px] bg-neutral-950 p-5 text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">LCDS Sports</p>
              <p className="mt-2 text-lg font-black leading-tight">Compra fácil. Recibe en toda Venezuela.</p>
              <p className="mt-3 text-xs leading-5 text-neutral-400">{settings.shippingText}</p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-neutral-950"
              >
                Comprar por WhatsApp
              </a>
            </div>
            <p className="mt-4 text-center text-[10px] font-semibold text-neutral-400">{settings.locationText}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
