import Link from "next/link";
import StoreFooter from "@/components/StoreFooter";
import StoreHeader from "@/components/StoreHeader";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  let data = fallbackCatalog;
  try {
    data = await getCatalogSnapshot();
  } catch {
    // Fallback seguro si la base de datos no está disponible.
  }

  const whatsappHref = `https://wa.me/${data.settings.whatsappPhone}`;

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StoreHeader settings={data.settings} />

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
        <div className="rounded-[32px] bg-neutral-950 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">LCDS Sports</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">Políticas de compra</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300">Condiciones generales para compras, pagos, disponibilidad, envíos y atención.</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <PolicyCard number="01" title="Compra y confirmación">
            El pedido se coordina por WhatsApp. Antes de pagar, confirma producto, cantidad, disponibilidad, precio y método de pago con nuestro equipo.
          </PolicyCard>

          <PolicyCard number="02" title="Precios">
            La tienda muestra el precio público en USD y, cuando corresponde, su monto en bolívares calculado con la tasa vigente configurada por LCDS Sports.
          </PolicyCard>

          <PolicyCard number="03" title="Disponibilidad">
            El stock mostrado sirve como referencia de disponibilidad. La reserva del producto queda confirmada cuando el pedido y el pago han sido validados.
          </PolicyCard>

          <PolicyCard number="04" title="Envíos">
            Los despachos nacionales se coordinan por Zoom o Tealca. La modalidad disponible se confirma al preparar el pedido.
          </PolicyCard>

          <PolicyCard number="05" title="Ventas al mayor">
            Los precios por volumen dependen de la cantidad y del producto. Las condiciones mayoristas se confirman antes del pago.
          </PolicyCard>

          <PolicyCard number="06" title="Atención">
            Para dudas sobre productos, pagos, despacho, cambios o reembolsos, utiliza el canal oficial de WhatsApp de LCDS Sports.
          </PolicyCard>
        </div>

        <section id="pagos" className="mt-8 rounded-[28px] border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Pagos</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Métodos disponibles</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.paymentMethods.map((method) => (
                <span key={method.id} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-black text-neutral-700">
                  {method.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/reembolsos" className="inline-flex min-h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-black text-white transition hover:bg-emerald-500 hover:text-neutral-950">
            VER CAMBIOS Y REEMBOLSOS
          </Link>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 px-6 text-sm font-black transition hover:border-neutral-950">
            HABLAR CON SOPORTE
          </a>
        </div>
      </section>

      <StoreFooter settings={data.settings} paymentMethods={data.paymentMethods} />
    </main>
  );
}

function PolicyCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-neutral-200 bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
        <span className="text-[10px] font-black tracking-[0.16em] text-emerald-700">{number}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-600">{children}</p>
    </article>
  );
}
