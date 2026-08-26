import Link from "next/link";
import { getCatalogSnapshot } from "@/lib/catalog";
import RateForm from "./RateForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let rate = 250;
  let products = 0;
  let databaseOnline = false;

  try {
    const snapshot = await getCatalogSnapshot();
    rate = snapshot.rateBcv;
    products = snapshot.products.length;
    databaseOnline = true;
  } catch {
    databaseOnline = false;
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-700">LCDS Sports</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Panel administrativo</h1>
          </div>
          <Link href="/" className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-xs font-black">VER TIENDA</Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Base de datos" value={databaseOnline ? "Conectada" : "Pendiente"} />
          <Stat label="Productos activos" value={String(products)} />
          <Stat label="Tasa BCV" value={`Bs. ${rate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`} />
        </div>

        <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7">
          <div className="max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-700">Configuración comercial</p>
            <h2 className="mt-1 text-2xl font-black">Actualizar tasa BCV</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              El precio principal en dólares no cambia. Al actualizar esta tasa, todos los montos visibles en bolívares se recalculan automáticamente usando la referencia BCV interna de cada producto.
            </p>
            <RateForm initialRate={rate} />
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">Siguiente módulo</p>
          <h2 className="mt-1 text-xl font-black">Productos y variantes</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Aquí se incorporarán edición de precio en divisas, referencia BCV interna, stock, presentaciones, mayoristas, imágenes, estado y visibilidad.
          </p>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
