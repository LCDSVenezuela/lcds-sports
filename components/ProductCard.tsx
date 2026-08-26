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
    <article className="group min-w-0 overflow-hidden rounded-[22px] border border-neutral-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_22px_55px_rgba(0,0,0,0.08)]">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f7f7f7_68%,#efefef_100%)]">
          <div className="absolute left-2.5 top-2.5 z-10 flex max-w-[84%] flex-wrap gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                {product.badge}
              </span>
            )}
            {product.freeShipping && (
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-neutral-950 shadow-sm">
                Envío gratis
              </span>
            )}
          </div>

          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.055]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-neutral-400">Sin imagen</div>
          )}

          <div className="pointer-events-none absolute inset-x-4 bottom-3 h-px origin-left scale-x-0 bg-emerald-500 transition duration-300 group-hover:scale-x-100" />
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">{product.brand}</p>
            <span className={`h-2 w-2 shrink-0 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
          </div>

          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5 text-neutral-950 sm:text-[15px]">
            {product.name}
          </h3>

          <div className="mt-2">
            <RatingStars rating={product.rating} count={product.reviewCount} compact />
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-3">
            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
              <p className="text-xl font-black tracking-[-0.03em] text-neutral-950 sm:text-2xl">{formatUsd(product.priceUsd)}</p>
              <p className="pb-0.5 text-xs font-bold text-neutral-500">{formatBs(bsPrice)}</p>
            </div>
            <p className="mt-1 text-[9px] font-semibold text-neutral-400">Precio USD · Bs. calculado con tasa vigente</p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wide ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
              {product.stock > 0 ? "Disponible" : "Agotado"}
            </span>
            <span className="text-[10px] font-black text-neutral-400 transition group-hover:text-neutral-800">Ver producto →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
