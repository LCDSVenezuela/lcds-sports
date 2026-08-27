import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import MarketingForm from "./MarketingForm";
import PaymentMethodsForm from "./PaymentMethodsForm";
import RateForm from "./RateForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdminPage();
  let snapshot = fallbackCatalog;
  let databaseOnline = false;

  try {
    snapshot = await getCatalogSnapshot();
    databaseOnline = true;
  } catch {
    databaseOnline = false;
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">LCDS Sports</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Centro de administración</h1>
            <p className="mt-1 text-xs text-neutral-400">Sesión: {session.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/productos" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black transition hover:bg-white/10">PRODUCTOS</Link>
            <Link href="/admin/catalogo" className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black transition hover:bg-white/10">MARCAS / CATEGORÍAS</Link>
            <Link href="/" className="flex min-h-11 items-center rounded-xl bg-emerald-500 px-4 text-xs font-black text-neutral-950">VER TIENDA</Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Base de datos" value={databaseOnline ? "Conectada" : "Fallback activo"} accent={databaseOnline} />
          <Stat label="Productos activos" value={String(snapshot.products.length)} />
          <Stat label="Banners activos" value={String(snapshot.banners.length)} />
          <Stat label="Tasa BCV" value={`Bs. ${snapshot.rateBcv.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-5 sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Configuración comercial</p>
              <h2 className="mt-1 text-2xl font-black">Tasa BCV</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">El precio principal en USD no cambia. La referencia BCV interna de cada producto se multiplica por esta tasa para mostrar únicamente el monto final en bolívares.</p>
              <RateForm initialRate={snapshot.rateBcv} />
            </section>

            <Link href="/admin/productos" className="group block rounded-3xl bg-emerald-500 p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,185,129,0.22)] sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950/70">Catálogo</p>
              <h2 className="mt-2 text-2xl font-black text-neutral-950">Productos, imágenes y precios</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-950/80">Gestiona título, descripción, galería, USD, referencia BCV, stock, reputación, etiquetas y precios al mayor.</p>
              <span className="mt-5 inline-block text-sm font-black text-neutral-950 transition group-hover:translate-x-1">Gestionar productos →</span>
            </Link>

            <Link href="/admin/catalogo" className="group block rounded-3xl bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)] sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Organización</p>
              <h2 className="mt-2 text-2xl font-black text-neutral-950">Marcas y categorías</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Crea, edita y activa las opciones que aparecerán al registrar productos.</p>
              <span className="mt-5 inline-block text-sm font-black text-neutral-950 transition group-hover:translate-x-1">Organizar catálogo →</span>
            </Link>

            <PaymentMethodsForm initialMethods={snapshot.paymentMethods} />
          </div>

          <div>
            <MarketingForm settings={snapshot.settings} banners={snapshot.banners} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        {accent && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      </div>
      <p className="mt-2 text-lg font-black sm:text-xl">{value}</p>
    </div>
  );
}
