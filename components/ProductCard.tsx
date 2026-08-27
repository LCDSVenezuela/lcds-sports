import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";
import RatingStars from "./RatingStars";

export default function ProductCard({ product, rateBcv }: { product: CatalogProduct; rateBcv: number }) {
  const bsPrice = calculateBcvBs(product.bcvReferenceUsd, rateBcv);

  return (
    <article className="group min-w-0 overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.09)] sm:rounded-[28px]">
      <Link href={`/producto/${product.slug}`} className="block h-full">
        <div className="relative aspect-[1/1.02] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f7f7f7_58%,#efefef_100%)]">
          <div className="absolute left-3 top-3 z-10 flex max-w-[86%] flex-wrap gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white sm:text-[9px]">
                {product.badge}
              </span>
            )}
            {product.freeShipping && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-400 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-neutral-950 shadow-sm sm:text-[9px]">
                Envío gratis
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/85 text-neutral-400 shadow-sm backdrop-blur transition duration-300 group-hover:bg-neutral-950 group-hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </div>

          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-5 transition duration-500 ease-out group-hover:scale-[1.045] sm:p-7"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-neutral-400">Sin imagen</div>
          )}

          <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-emerald-500 transition duration-300 group-hover:scale-x-100" />
        </div>

        <div className="flex min-h-[220px] flex-col p-4 sm:min-h-[236px] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[8px] font-black uppercase tracking-[0.18em] text-neutral-400 sm:text-[9px]">{product.brand}</p>
              <h3 className="mt-1.5 line-clamp-2 text-[14px] font-black leading-5 tracking-[-0.015em] text-neutral-950 sm:text-[16px] sm:leading-[22px]">
                {product.name}
              </h3>
            </div>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
          </div>

          <div className="mt-3">
            <RatingStars rating={product.rating} count={product.reviewCount} compact />
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
              <div className="min-w-0">
                <p className="text-[22px] font-black leading-none tracking-[-0.045em] text-neutral-950 sm:text-[26px]">{formatUsd(product.priceUsd)}</p>
                <p className="mt-1.5 truncate text-[11px] font-bold text-neutral-500 sm:text-xs">{formatBs(bsPrice)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.1em] sm:text-[9px] ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {product.stock > 0 ? "Disponible" : "Agotado"}
              </span>
            </div>
            <p className="mt-2 text-[8px] font-semibold leading-4 text-neutral-400 sm:text-[9px]">USD público · Bs. calculado con tasa vigente</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
