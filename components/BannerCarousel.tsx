"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { StoreBanner } from "@/lib/catalog";

export default function BannerCarousel({ banners }: { banners: StoreBanner[] }) {
  const items = useMemo(() => banners.slice(0, 3), [banners]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[Math.min(active, items.length - 1)];

  function move(direction: number) {
    setActive((index) => (index + direction + items.length) % items.length);
  }

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-neutral-950 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
      <div className="relative min-h-[390px] sm:min-h-[430px] lg:min-h-[510px]">
        <picture key={`${current.id}-${active}`} className="absolute inset-0 block">
          {current.mobileImageUrl && (
            <source media="(max-width: 767px)" srcSet={current.mobileImageUrl} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.imageUrl}
            alt={current.title || "Banner LCDS Sports"}
            className="banner-enter h-full w-full object-cover"
          />
        </picture>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,6,0.90)_0%,rgba(4,8,6,0.68)_42%,rgba(4,8,6,0.12)_76%,rgba(4,8,6,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.5)_0%,transparent_48%)]" />

        <div className="relative z-10 flex min-h-[390px] max-w-2xl flex-col justify-end px-6 pb-9 pt-16 text-white sm:min-h-[430px] sm:px-9 sm:pb-11 lg:min-h-[510px] lg:px-14 lg:pb-16">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400">
            <span className="h-px w-8 bg-emerald-400" />
            LCDS Sports · Venezuela
          </div>
          {current.title && (
            <h1 className="max-w-xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {current.title}
            </h1>
          )}
          {current.subtitle && (
            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-200 sm:text-base sm:leading-7">
              {current.subtitle}
            </p>
          )}
          {current.ctaText && current.ctaHref && (
            <div className="mt-6">
              <Link
                href={current.ctaHref}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-black text-neutral-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                {current.ctaText}
                <svg viewBox="0 0 24 24" className="ml-2 h-4 w-4 fill-none stroke-current" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {items.length > 1 && (
          <>
            <div className="absolute bottom-5 right-5 z-20 flex gap-2 sm:bottom-7 sm:right-7">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Banner anterior"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Siguiente banner"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="absolute bottom-6 left-6 z-20 flex gap-1.5 sm:bottom-8 sm:left-9 lg:left-14">
              {items.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Ir al banner ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === active ? "w-8 bg-emerald-400" : "w-3 bg-white/45"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
