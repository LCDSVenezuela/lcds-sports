"use client";

import { useEffect, useState } from "react";

type PublicBrand = {
  id: number;
  name: string;
  logoUrl: string;
};

export default function BrandCarousel() {
  const [brands, setBrands] = useState<PublicBrand[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/brands", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data?.brands) ? data.brands : [];
        setBrands(items.filter((brand: PublicBrand) => Boolean(brand.logoUrl)));
      })
      .catch(() => {
        if (!cancelled) setBrands([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!brands.length) return null;

  if (brands.length === 1) {
    const brand = brands[0];
    return (
      <div className="mt-3 overflow-hidden rounded-[22px] border border-neutral-200 bg-white px-6 py-5 sm:rounded-[26px]">
        <div className="flex items-center justify-center">
          <img src={brand.logoUrl} alt={brand.name} className="h-9 max-w-[150px] object-contain sm:h-11 sm:max-w-[180px]" />
        </div>
      </div>
    );
  }

  return (
    <section className="brand-marquee mt-3 overflow-hidden rounded-[22px] border border-neutral-200 bg-white sm:rounded-[26px]" aria-label="Marcas disponibles">
      <div className="brand-marquee-track flex w-max items-center py-5 sm:py-6">
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            aria-hidden={copyIndex === 1}
            className="brand-marquee-group flex min-w-[min(100vw,80rem)] shrink-0 items-center justify-around gap-10 px-7 sm:gap-14 sm:px-10 lg:gap-20 lg:px-14"
          >
            {brands.map((brand) => (
              <div key={`${copyIndex}-${brand.id}`} className="flex min-w-[120px] items-center justify-center sm:min-w-[150px] lg:min-w-[170px]">
                <img
                  src={brand.logoUrl}
                  alt={copyIndex === 0 ? brand.name : ""}
                  className="h-8 max-w-[125px] object-contain opacity-65 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10 sm:max-w-[150px] lg:h-11 lg:max-w-[170px]"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
