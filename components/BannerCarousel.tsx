"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandCarousel from "@/components/BrandCarousel";
import type { StoreBanner } from "@/lib/catalog";

export default function BannerCarousel({ banners }: { banners: StoreBanner[] }) {
  const items = banners.filter((banner) => banner.active && Boolean(banner.imageUrl?.trim())).slice(0, 3);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timeout = window.setTimeout(() => {
      setActive((current) => (current + 1) % items.length);
    }, 5200);
    return () => window.clearTimeout(timeout);
  }, [active, items.length]);

  if (!items.length) return null;

  const safeActive = active % items.length;
  const current = items[safeActive];

  function move(direction: number) {
    if (items.length <= 1) return;
    setActive((currentIndex) => (currentIndex + direction + items.length) % items.length);
  }

  return (
    <>
      <section className="group relative isolate overflow-hidden rounded-[28px] bg-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.14)] sm:rounded-[34px]">
        <div className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[560px]">
          <picture key={`banner-picture-${current.id}-${safeActive}`} className="absolute inset-0 block">
            {current.mobileImageUrl && <source media="(max-width: 767px)" srcSet={current.mobileImageUrl} />}
            <img
              key={`banner-image-${current.id}-${safeActive}`}
              src={current.imageUrl}
              alt={current.title || `Banner ${safeActive + 1} LCDS Sports`}
              className="banner-enter h-full w-full object-cover"
            />
          </picture>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,6,0.92)_0%,rgba(5,7,6,0.78)_33%,rgba(5,7,6,0.42)_58%,rgba(5,7,6,0.12)_82%,rgba(5,7,6,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.66)_0%,transparent_48%)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

          <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/85 backdrop-blur-md sm:left-7 sm:top-7">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Equipamiento deportivo
          </div>

          <div
            key={`banner-copy-${current.id}-${safeActive}`}
            className="relative z-10 flex min-h-[460px] max-w-[780px] flex-col justify-end px-5 pb-20 pt-24 text-white sm:min-h-[500px] sm:px-8 sm:pb-20 lg:min-h-[560px] lg:px-14 lg:pb-24"
          >
            <div className="mb-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.24em] text-emerald-400 sm:text-[10px]">
              <span className="h-px w-9 bg-emerald-400" />
              LCDS Sports · Venezuela
            </div>

            {current.title && (
              <h1 className="max-w-3xl text-[42px] font-black uppercase leading-[0.9] tracking-[-0.055em] sm:text-[58px] lg:text-[72px]">
                {current.title}
              </h1>
            )}

            {current.subtitle && (
              <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/75 sm:text-base sm:leading-7">
                {current.subtitle}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {current.ctaText && current.ctaHref && (
                <Link
                  href={current.ctaHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-5 text-[12px] font-black text-neutral-950 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  {current.ctaText}
                  <svg viewBox="0 0 24 24" className="ml-2 h-4 w-4 fill-none stroke-current" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              )}
              <Link
                href="#productos"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 text-[12px] font-black text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white hover:text-neutral-950"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>

          <div className="absolute inset-x-5 bottom-5 z-20 flex items-end justify-between gap-3 sm:inset-x-8 sm:bottom-7 lg:inset-x-14">
            <div className="flex items-center gap-2">
              {items.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Ir al banner ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === safeActive ? "w-9 bg-emerald-400" : "w-3 bg-white/35 hover:bg-white/70"}`}
                />
              ))}
              {items.length > 1 && (
                <span className="ml-1 text-[9px] font-black tracking-[0.16em] text-white/50">
                  0{safeActive + 1} / 0{items.length}
                </span>
              )}
            </div>

            {items.length > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Banner anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white hover:text-black sm:h-11 sm:w-11"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Siguiente banner"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white hover:text-black sm:h-11 sm:w-11"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <BrandCarousel />
    </>
  );
}
