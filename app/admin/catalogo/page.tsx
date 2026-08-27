import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth";
import { getTaxonomies } from "@/lib/admin-taxonomy";
import TaxonomyManager from "./TaxonomyManager";

export const dynamic = "force-dynamic";

export default async function CatalogStructurePage() {
  await requireAdminPage();
  const taxonomies = await getTaxonomies(true);

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">LCDS Sports · Admin</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Marcas y categorías</h1>
            <p className="mt-1 text-xs text-neutral-400">Estructura base del catálogo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black">PANEL</Link>
            <Link href="/admin/productos" className="flex min-h-11 items-center rounded-xl bg-emerald-500 px-4 text-xs font-black text-neutral-950">PRODUCTOS</Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-3xl bg-neutral-950 p-5 text-white sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Catálogo organizado</p>
          <h2 className="mt-2 text-2xl font-black">Evita escribir marcas y categorías distintas por error.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">Las opciones activas aparecerán directamente al crear o editar productos. Desactivar una opción no borra los productos existentes.</p>
        </div>
        <TaxonomyManager brands={taxonomies.brands} categories={taxonomies.categories} />
      </div>
    </main>
  );
}
