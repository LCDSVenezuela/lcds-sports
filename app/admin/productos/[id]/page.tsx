import Link from "next/link";
import { notFound } from "next/navigation";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { requireAdminPage } from "@/lib/admin-auth";
import { getTaxonomies } from "@/lib/admin-taxonomy";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const productId = Number(id);
  let snapshot = fallbackCatalog;
  let brands: string[] = [];
  let categories: string[] = [];

  try {
    const [catalog, taxonomies] = await Promise.all([getCatalogSnapshot(), getTaxonomies(false)]);
    snapshot = catalog;
    brands = taxonomies.brands.map((item) => item.name);
    categories = taxonomies.categories.map((item) => item.name);
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
            <Link href="/admin/catalogo" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black">MARCAS / CATEGORÍAS</Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ProductForm product={product} rateBcv={snapshot.rateBcv} brands={brands} categories={categories} />

        <section className="mt-6 rounded-3xl border border-red-200 bg-white p-5 sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Zona de eliminación</p>
          <h2 className="mt-1 text-xl font-black">Eliminar este producto</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            El producto desaparecerá del catálogo. Sus imágenes y precios por cantidad asociados también serán eliminados.
          </p>
          <div className="mt-5">
            <DeleteProductButton productId={product.id} productName={product.name} />
          </div>
        </section>
      </div>
    </main>
  );
}
