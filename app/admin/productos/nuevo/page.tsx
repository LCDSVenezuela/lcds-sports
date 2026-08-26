import Link from "next/link";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let rateBcv = fallbackCatalog.rateBcv;
  try {
    rateBcv = (await getCatalogSnapshot()).rateBcv;
  } catch {
    // Usa la tasa fallback si la base aún no está lista.
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">LCDS Sports · Productos</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Nuevo producto</h1>
          </div>
          <Link href="/admin/productos" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black">VOLVER</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ProductForm rateBcv={rateBcv} />
      </div>
    </main>
  );
}
