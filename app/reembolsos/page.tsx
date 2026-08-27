import Link from "next/link";
import StoreFooter from "@/components/StoreFooter";
import StoreHeader from "@/components/StoreHeader";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";

export const dynamic = "force-dynamic";

export default async function RefundsPage() {
  let data = fallbackCatalog;
  try {
    data = await getCatalogSnapshot();
  } catch {
    // Fallback seguro si la base de datos no está disponible.
  }

  const whatsappHref = `https://wa.me/${data.settings.whatsappPhone}?text=${encodeURIComponent("Hola, LCDS Sports. Quiero consultar un cambio o reembolso.")}`;

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StoreHeader settings={data.settings} />

      <section className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-16">
        <div className="rounded-[32px] bg-neutral-950 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Ayuda LCDS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Cambios y reembolsos</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300">Cada solicitud se revisa según el estado del pedido, el producto y el motivo reportado.</p>
        </div>

        <div className="mt-8 space-y-4">
          <RefundSection title="Antes del despacho">
            Si necesitas corregir o cancelar un pedido antes de su despacho, comunícate de inmediato por WhatsApp. Si ya existe un pago confirmado, el caso será revisado antes de procesar cualquier devolución.
          </RefundSection>

          <RefundSection title="Producto incorrecto o con inconveniente">
            Si recibiste un artículo distinto al acordado o detectas un inconveniente al recibirlo, repórtalo por WhatsApp con fotos o video y los datos del pedido para poder revisarlo.
          </RefundSection>

          <RefundSection title="Cambios por decisión del cliente">
            Los cambios voluntarios se evalúan según el estado del producto, su empaque y la disponibilidad de reemplazo. Los artículos usados, alterados o deteriorados después de la entrega pueden no aplicar.
          </RefundSection>

          <RefundSection title="Reembolso aprobado">
            Cuando una devolución sea aprobada, LCDS Sports coordinará el método de reintegro con el cliente. El tiempo final puede variar según el medio de pago utilizado.
          </RefundSection>

          <RefundSection title="Cómo solicitarlo">
            Escríbenos por WhatsApp indicando producto, cantidad, motivo de la solicitud y cualquier evidencia necesaria. No envíes un producto de regreso sin coordinación previa.
          </RefundSection>
        </div>

        <div className="mt-8 rounded-[28px] bg-emerald-400 p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950/70">Soporte</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-950">¿Necesitas revisar un caso?</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-black text-white">
              ESCRIBIR POR WHATSAPP
            </a>
            <Link href="/politicas" className="inline-flex min-h-12 items-center justify-center rounded-full border border-emerald-950/20 px-6 text-sm font-black text-neutral-950">
              VER POLÍTICAS DE COMPRA
            </Link>
          </div>
        </div>
      </section>

      <StoreFooter settings={data.settings} paymentMethods={data.paymentMethods} />
    </main>
  );
}

function RefundSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-neutral-200 bg-white p-6 sm:p-7">
      <h2 className="text-xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{children}</p>
    </article>
  );
}
