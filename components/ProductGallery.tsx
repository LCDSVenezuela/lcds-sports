"use client";

import { useState } from "react";
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
  const current = gallery[Math.min(active, Math.max(0, gallery.length - 1))];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-neutral-100 text-sm font-bold text-neutral-400">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[74px_minmax(0,1fr)]">
      <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
        {gallery.map((image, index) => (
          <button
            key={`${image.id}-${image.imageUrl}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Ver imagen ${index + 1}`}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition sm:h-[74px] sm:w-[74px] ${
              active === index ? "border-emerald-500 ring-2 ring-emerald-500/15" : "border-neutral-200"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.imageUrl} alt="" className="h-full w-full object-contain p-1.5" />
          </button>
        ))}
      </div>

      <div className="order-1 relative aspect-square overflow-hidden rounded-3xl bg-neutral-50 sm:order-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.imageUrl}
          src={current.imageUrl}
          alt={current.altText || productName}
          className="product-image-enter h-full w-full object-contain p-6 sm:p-8"
        />
      </div>
    </div>
  );
}
