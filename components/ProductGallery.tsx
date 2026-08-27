"use client";

import { useEffect, useState } from "react";
import type { ProductImage } from "@/lib/catalog";

export default function ProductGallery({
  images,
  fallbackImage,
  productName,
}: {
  images: ProductImage[];
  fallbackImage: string | null;
  productName: string;
}) {
  const gallery = images.length
    ? images
    : fallbackImage
      ? [{ id: 0, imageUrl: fallbackImage, altText: productName, sortOrder: 0 }]
      : [];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const safeActive = Math.min(active, Math.max(0, gallery.length - 1));
  const current = gallery[safeActive];

  useEffect(() => {
    if (!zoomed) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowRight" && gallery.length > 1) {
        setActive((value) => (value + 1) % gallery.length);
      }
      if (event.key === "ArrowLeft" && gallery.length > 1) {
        setActive((value) => (value - 1 + gallery.length) % gallery.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomed, gallery.length]);

  function move(direction: number) {
    if (gallery.length <= 1) return;
    setActive((value) => (value + direction + gallery.length) % gallery.length);
  }

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[28px] bg-neutral-100 text-sm font-bold text-neutral-400">
        Sin imagen
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)] lg:gap-4">
        <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible sm:pb-0">
          {gallery.map((image, index) => (
            <button
              key={`${image.id}-${image.imageUrl}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={`relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[14px] border bg-white transition duration-200 sm:h-[76px] sm:w-[76px] ${
                safeActive === index
                  ? "border-neutral-950 ring-1 ring-neutral-950"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="" className="h-full w-full object-contain p-2" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="group order-1 relative aspect-square overflow-hidden rounded-[28px] bg-[#f7f7f7] text-left sm:order-2 lg:rounded-[34px]"
          aria-label="Ampliar imagen del producto"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.imageUrl}
            src={current.imageUrl}
            alt={current.altText || productName}
            className="product-image-enter h-full w-full object-contain p-7 transition duration-500 group-hover:scale-[1.025] sm:p-10 lg:p-12"
          />

          <span className="absolute right-4 top-4 rounded-full border border-black/5 bg-white/90 px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-neutral-600 shadow-sm backdrop-blur">
            {safeActive + 1} / {gallery.length}
          </span>

          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-90 transition group-hover:bg-emerald-400 group-hover:text-neutral-950">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4M11 8v6M8 11h6" />
            </svg>
            Ampliar
          </span>
        </button>
      </div>

      {zoomed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Vista ampliada del producto">
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Cerrar imagen ampliada"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition hover:bg-emerald-400 sm:right-6 sm:top-6"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black sm:left-6"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Siguiente imagen"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black sm:right-6"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.imageUrl} alt={current.altText || productName} className="max-h-[88vh] max-w-[92vw] object-contain" />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-[0.14em] text-white/70 backdrop-blur sm:bottom-6">
            {safeActive + 1} / {gallery.length}
          </div>
        </div>
      )}
    </>
  );
}
