import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import StoreFooter from "@/components/StoreFooter";
import StoreHeader from "@/components/StoreHeader";
import { getCatalogSnapshot, type CatalogProduct } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora todos los productos disponibles en LCDS Sports.",
};

type CatalogPageProps = {
  searchParams: Promise<{ q?: string | string[]; categoria?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalize(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function matchesQuery(product: CatalogProduct, query: string) {
  if (!query) return true;

  const searchable = [
    product.name,
    product.brand,
    product.category,
    product.subtitle,
    product.description,
    product.sku,
    product.badge,
    ...product.labels,
  ]
    .map(normalize)
    .join(" ");

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchable.includes(term));
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const rawQuery = firstValue(params.q);
  const rawCategory = firstValue(params.categoria);
  const query = normalize(rawQuery);
  const category = normalize(rawCategory);

  let data = fallbackCatalog;
  try {
    data = await getCatalogSnapshot();
  } catch {
    // Mantiene visible el catálogo seguro si la base de datos no responde.
  }

  const categories = Array.from(new Set(data.products.map((product) => product.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "es"));

  const products = data.products.filter(
    (product) => matchesQuery(product, query) && (!category || normalize(product.category) === category),
  );

  const hasFilters = Boolean(query || category);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <StoreHeader settings={data.settings} />

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-11">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">LCDS Sports</p>
          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Catálogo de productos</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                Busca por producto, marca, categoría o código y encuentra todo sin recorrer el inicio.
              </p>
            </div>

            <form action="/catalogo" method="get" role="search" className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-neutral-300 bg-neutral-50 p-2 focus-within:border-emerald-500 focus-within:bg-white">
              <svg viewBox="0 0 24 24" className="ml-2 h-5 w-5 shrink-0 fill-none stroke-neutral-400" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <label htmlFor="catalog-search" className="sr-only">Buscar en el catálogo</label>
              <input
                id="catalog-search"
                name="q"
                type="search"
                defaultValue={rawQuery}
                placeholder="Ej.: pelotas, Tamanaco, guantes…"
                className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold outline-none"
              />
              {rawCategory && <input type="hidden" name="categoria" value={rawCategory} />}
              <button type="submit" className="min-h-11 rounded-xl bg-neutral-950 px-5 text-xs font-black text-white transition hover:bg-emerald-500 hover:text-neutral-950">
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8 lg:py-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href={rawQuery ? `/catalogo?q=${encodeURIComponent(rawQuery)}` : "/catalogo"}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition ${!category ? "bg-neutral-950 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"}`}
          >
            Todos
          </Link>
          {categories.map((item) => {
            const href = `/catalogo?categoria=${encodeURIComponent(item)}${rawQuery ? `&q=${encodeURIComponent(rawQuery)}` : ""}`;
            const active = normalize(item) === category;
            return (
              <Link
                key={item}
                href={href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition ${active ? "bg-emerald-500 text-neutral-950" : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"}`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        <div className="mb-6 mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-neutral-600">
            {products.length} {products.length === 1 ? "producto encontrado" : "productos encontrados"}
            {rawQuery && <> para <span className="text-neutral-950">“{rawQuery}”</span></>}
          </p>
          {hasFilters && (
            <Link href="/catalogo" className="text-xs font-black text-emerald-700 hover:text-neutral-950">
              Limpiar filtros
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} rateBcv={data.rateBcv} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <p className="text-xl font-black">No encontramos productos</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Prueba con otro nombre, una marca o una categoría más amplia.
            </p>
            <Link href="/catalogo" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-5 text-xs font-black text-white">
              Ver todos los productos
            </Link>
          </div>
        )}
      </section>

      <StoreFooter settings={data.settings} paymentMethods={data.paymentMethods} />
    </main>
  );
}
