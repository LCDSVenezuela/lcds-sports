import Link from "next/link";
import { notFound } from "next/navigation";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const productId = Number(id);
  let snapshot = fallbackCatalog;

  try {
    snapshot = await getCatalogSnapshot();
  } catch {
    // Mantiene acceso al editor con los datos fallback si la base no responde.
  }

  const product = snapshot.products.find((item) => item.id === productId);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">LCDS Sports · Productos</p>
            <h1 className="mt-1 truncate text-2xl font-black sm:text-3xl">Editar producto</h1>
            <p className="mt-1 truncate text-xs text-neutral-400">{product.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/productos" className="flex min-h-11 shrink-0 items-center rounded-xl border border-white/15 px-4 text-xs font-black">VOLVER</Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ProductForm product={product} rateBcv={snapshot.rateBcv} />
      </div>
    </main>
  );
}
