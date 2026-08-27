import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import ProductAdminActions from "@/components/admin/ProductAdminActions";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/admin-products";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  await requireAdminPage();
  let rateBcv = fallbackCatalog.rateBcv;
  let products = fallbackCatalog.products.map((product, index) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    category: product.category,
    image: product.image,
    badge: product.badge,
    priceUsd: product.priceUsd,
    bcvReferenceUsd: product.bcvReferenceUsd,
    stock: product.stock,
    active: true,
    featured: product.featured,
    rating: product.rating,
    sortOrder: index + 1,
  }));
  let databaseOnline = false;

  try {
    const [snapshot, adminProducts] = await Promise.all([getCatalogSnapshot(), getAdminProducts()]);
    rateBcv = snapshot.rateBcv;
    products = adminProducts;
    databaseOnline = true;
  } catch {
    databaseOnline = false;
  }

  const activeCount = products.filter((product) => product.active).length;
  const inactiveCount = products.length - activeCount;

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">LCDS Sports · Admin</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Productos</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black">PANEL</Link>
            <Link href="/admin/productos/nuevo" className="flex min-h-11 items-center rounded-xl bg-emerald-500 px-4 text-xs font-black text-neutral-950">+ NUEVO PRODUCTO</Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-neutral-500">{products.length} productos · {activeCount} activos · {inactiveCount} inactivos</p>
            <p className="mt-1 text-xs text-neutral-400">{databaseOnline ? "Datos en PostgreSQL" : "Mostrando fallback hasta conectar la base"}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-neutral-500">Tasa: Bs. {rateBcv.toLocaleString("es-VE")}</span>
        </div>

        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className={`grid gap-4 rounded-2xl bg-white p-4 sm:grid-cols-[84px_1fr_auto] sm:items-start sm:p-5 ${product.active ? "" : "opacity-70"}`}>
              <div className="h-20 w-20 overflow-hidden rounded-xl bg-neutral-50">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="h-full w-full object-contain p-1" />
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">{product.brand}</p>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${product.active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                  {product.stock <= 0 && <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-black uppercase text-red-600">Agotado</span>}
                  {product.badge && <span className="rounded-full bg-neutral-100 px-2 py-1 text-[9px] font-black uppercase text-neutral-500">{product.badge}</span>}
                </div>
                <h2 className="mt-1 truncate text-base font-black sm:text-lg">{product.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-neutral-500">
                  <span>{formatUsd(product.priceUsd)}</span>
                  <span>{formatBs(calculateBcvBs(product.bcvReferenceUsd, rateBcv))}</span>
                  <span>Stock {product.stock}</span>
                  <span>★ {product.rating.toFixed(1)}</span>
                  <span>Orden {product.sortOrder}</span>
                </div>
                {databaseOnline && <ProductAdminActions productId={product.id} active={product.active} stock={product.stock} />}
              </div>

              <div className="flex gap-2 sm:justify-end">
                {product.active && <Link href={`/producto/${product.slug}`} className="flex min-h-11 items-center rounded-xl border border-neutral-200 px-4 text-xs font-black">VER</Link>}
                <Link href={`/admin/productos/${product.id}`} className="flex min-h-11 items-center rounded-xl bg-neutral-950 px-4 text-xs font-black text-white">EDITAR</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
