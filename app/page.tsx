import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";
import ProductCard from "@/components/ProductCard";
import StoreFooter from "@/components/StoreFooter";
import StoreHeader from "@/components/StoreHeader";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";

export const dynamic = "force-dynamic";

const categories = [
  { name: "Pelotas", eyebrow: "Softball", code: "01" },
  { name: "Guantes", eyebrow: "Equipamiento", code: "02" },
  { name: "Bates", eyebrow: "Potencia", code: "03" },
  { name: "Protección", eyebrow: "Seguridad", code: "04" },
  { name: "Entrenamiento", eyebrow: "Rendimiento", code: "05" },
  { name: "Accesorios", eyebrow: "Complementos", code: "06" },
];

export default async function Home() {
  let data = fallbackCatalog;
  try {
    data = await getCatalogSnapshot();
  } catch {
    // La tienda mantiene una versión segura mientras la base de datos se recupera.
  }

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StoreHeader settings={data.settings} />

      <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-8 lg:pt-6">
        <BannerCarousel banners={data.banners} />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-11">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Explora LCDS</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Compra por categoría</h2>
          </div>
          <Link href="#productos" className="hidden text-xs font-black text-neutral-500 transition hover:text-neutral-950 sm:block">Ver catálogo →</Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="#productos"
              className="group relative min-h-32 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]"
            >
              <span className="absolute right-3 top-2 text-4xl font-black text-neutral-100 transition group-hover:text-emerald-50">{category.code}</span>
              <p className="relative text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700">{category.eyebrow}</p>
              <h3 className="relative mt-8 text-base font-black sm:text-lg">{category.name}</h3>
              <span className="relative mt-2 inline-block text-xs font-bold text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-700">Explorar →</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="productos" className="border-y border-neutral-100 bg-neutral-50/70">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Selección LCDS</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Productos destacados</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">Precios claros en USD y su monto correspondiente en bolívares según la tasa vigente.</p>
            </div>
            <div className="hidden rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:block">
              {data.products.length} productos
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} rateBcv={data.rateBcv} />
            ))}
          </div>
        </div>
      </section>

      <section id="mayor" className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="relative overflow-hidden rounded-[30px] bg-neutral-950 p-6 text-white sm:p-9 lg:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[42px] border-emerald-500/10" />
          <div className="absolute bottom-0 right-1/4 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Ventas al mayor</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black leading-[1.03] tracking-tight sm:text-4xl">{data.settings.wholesaleTitle}</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">{data.settings.wholesaleText}</p>
              <a
                href={`https://wa.me/${data.settings.whatsappPhone}?text=${encodeURIComponent("Hola, LCDS Sports. Quiero información sobre precios al mayor.")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                CONSULTAR AL MAYOR
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <WholesalePoint number="01" title="Equipos" text="Compra para entrenamiento o competencia." />
              <WholesalePoint number="02" title="Academias" text="Condiciones para formación y práctica." />
              <WholesalePoint number="03" title="Comercios" text="Precios pensados para reventa." />
              <WholesalePoint number="04" title="Cantidad" text="Mejor precio según volumen." />
            </div>
          </div>
        </div>
      </section>

      <section id="confianza" className="mx-auto max-w-7xl px-4 pb-12 lg:px-8 lg:pb-16">
        <div className="grid overflow-hidden rounded-[30px] border border-neutral-200 lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Compra con confianza</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Pagos y envíos claros</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">{data.settings.shippingText}. Antes de cerrar tu compra coordinamos disponibilidad, pago y despacho directamente contigo.</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TrustItem title="Precio en USD" text="Zelle, USDT, divisas y depósito bancario." />
              <TrustItem title="Pago en Bs." text="Calculado automáticamente con la tasa vigente." />
              <TrustItem title="Atención humana" text="Tu pedido se coordina directamente por WhatsApp." />
              <TrustItem title="Portuguesa" text="Operación local con envíos a toda Venezuela." />
            </div>
          </div>

          <div className="bg-neutral-950 p-6 text-white sm:p-8 lg:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Métodos disponibles</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {data.paymentMethods.map((method) => (
                <div key={method.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-black">{method.name}</p>
                  {method.detail && <p className="mt-1 text-xs leading-5 text-neutral-400">{method.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StoreFooter settings={data.settings} paymentMethods={data.paymentMethods} />
    </main>
  );
}

function WholesalePoint({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <span className="text-[10px] font-black text-emerald-400">{number}</span>
      <p className="mt-4 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
    </div>
  );
}

function TrustItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <div className="mb-3 h-1 w-8 rounded-full bg-emerald-500" />
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
    </div>
  );
}
