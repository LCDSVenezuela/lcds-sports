import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";
import RatingStars from "./RatingStars";

export default function ProductCard({
  product,
  rateBcv,
}: {
  product: CatalogProduct;
  rateBcv: number;
}) {
  const bsPrice = calculateBcvBs(product.bcvReferenceUsd, rateBcv);

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          <div className="absolute left-2 top-2 z-10 flex max-w-[80%] flex-wrap gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                {product.badge}
              </span>
            )}
            {product.freeShipping && (
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-neutral-950">
                Envío
              </span>
            )}
          </div>

          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-neutral-400">Sin imagen</div>
          )}
        </div>

        <div className="p-3.5 sm:p-4">
          <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5 text-neutral-950 sm:text-[15px]">
            {product.name}
          </h3>
          <div className="mt-2">
            <RatingStars rating={product.rating} count={product.reviewCount} compact />
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
            <p className="text-xl font-black tracking-tight text-neutral-950 sm:text-2xl">{formatUsd(product.priceUsd)}</p>
            <p className="pb-0.5 text-xs font-bold text-neutral-500">{formatBs(bsPrice)}</p>
          </div>
          <p className="mt-1 text-[9px] font-semibold text-neutral-400">USD principal · Bs. según tasa vigente</p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wide ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
              {product.stock > 0 ? "Disponible" : "Agotado"}
            </span>
            <span className="text-[10px] font-bold text-neutral-400">Ver detalle →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
