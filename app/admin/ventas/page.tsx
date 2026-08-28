import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import { getRecentSalesDocuments } from "@/lib/sales";
import SalesPanel from "./SalesPanel";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const session = await requireAdminPage();
  let snapshot = fallbackCatalog;
  let documents = [];

  try {
    [snapshot, documents] = await Promise.all([
      getCatalogSnapshot(),
      getRecentSalesDocuments(),
    ]);
  } catch {
    // El panel muestra el catálogo seguro; la creación requiere la base conectada.
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">LCDS Sports</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Panel de ventas</h1>
            <p className="mt-1 text-xs text-neutral-400">Cotizaciones y notas de entrega</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black transition hover:bg-white/10">ADMINISTRACIÓN</Link>
            <Link href="/admin/productos" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black transition hover:bg-white/10">PRODUCTOS</Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SalesPanel
          products={snapshot.products}
          paymentMethods={snapshot.paymentMethods}
          rateBcv={snapshot.rateBcv}
          sellerEmail={session.email}
          today={today}
          initialDocuments={documents}
        />
      </div>
    </main>
  );
}
