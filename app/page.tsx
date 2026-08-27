import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";
import BrandCarousel from "@/components/BrandCarousel";
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
        <BrandCarousel />
      </div>

      <section id="categorias" className="mx-auto max-w-7xl px-4 py-9 lg:px-8 lg:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Explora LCDS</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Encuentra lo que necesitas</h2>
          </div>
          <Link href="#productos" className="hidden text-xs font-black text-neutral-500 transition hover:text-neutral-950 sm:block">Ver catálogo →</Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="#productos"
              className="group relative min-h-36 overflow-hidden rounded-[22px] border border-neutral-200 bg-neutral-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]"
            >
              <span className="absolute right-3 top-1 text-[44px] font-black tracking-[-0.08em] text-neutral-100 transition duration-300 group-hover:-translate-y-1 group-hover:text-emerald-50">{category.code}</span>
              <div className="relative flex h-full flex-col justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700">{category.eyebrow}</p>
                <div className="pt-10">
                  <h3 className="text-base font-black sm:text-lg">{category.name}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-700">Explorar <span>→</span></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="productos" className="border-y border-neutral-100 bg-neutral-50/70">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Catálogo LCDS</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Productos destacados</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{data.products.length} productos</span>
              <span className="hidden rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800 sm:inline-flex">Stock visible</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} rateBcv={data.rateBcv} />
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <a
              href={`https://wa.me/${data.settings.whatsappPhone}?text=${encodeURIComponent("Hola, LCDS Sports. Quiero ayuda para elegir un producto del catálogo.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-black transition duration-300 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
            >
              ¿Necesitas ayuda para elegir? →
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-7 max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">La experiencia LCDS</p>
          <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.035em] sm:text-4xl">¿Por qué comprar en LCDS?</h2>
        </div>

        <div className="grid grid-cols-2 border-l border-t border-neutral-200 md:grid-cols-4">
          <WhyBuyCard
            icon="shipping"
            title="Envío gratis"
            text="Despachamos por Zoom y Tealca a toda Venezuela sin costo de envío."
          />
          <WhyBuyCard
            icon="support"
            title="Atención directa"
            text="Te atendemos por WhatsApp para confirmar producto, pago y despacho."
          />
          <WhyBuyCard
            icon="price"
            title="Precios claros"
            text="Ves el precio público en USD y su monto en Bs. con la tasa vigente."
          />
          <WhyBuyCard
            icon="wholesale"
            title="Detal y mayor"
            text="Compra una unidad o accede a mejores precios cuando compras por volumen."
          />
        </div>
      </section>

      <section id="envios" className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="relative overflow-hidden rounded-[32px] bg-emerald-500 p-6 sm:p-9 lg:p-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[46px] border-neutral-950/5" />
          <div className="absolute bottom-0 right-1/3 h-28 w-28 rounded-full bg-white/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Beneficio LCDS
              </div>
              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.045em] text-neutral-950 sm:text-5xl">
                Envío <span className="text-white">GRATIS</span> por Zoom y Tealca.
              </h2>
              <p className="mt-4 max-w-xl text-sm font-semibold text-emerald-950/80 sm:text-base">Disponible para despachos nacionales coordinados por WhatsApp.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <ShippingCard name="ZOOM" text="Cobertura nacional y coordinación por WhatsApp." />
              <ShippingCard name="TEALCA" text="Otra opción gratuita para recibir tu pedido." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-8 lg:pb-14">
        <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 p-6 text-white sm:p-9 lg:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[42px] border-emerald-500/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">LCDS Mayoristas</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black leading-[1.03] tracking-tight sm:text-4xl">{data.settings.wholesaleTitle}</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/mayoristas" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-emerald-400">
                  VER PÁGINA MAYORISTA
                </Link>
                <a
                  href={`https://wa.me/${data.settings.whatsappPhone}?text=${encodeURIComponent("Hola, LCDS Sports. Quiero información sobre compras al mayor.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-black transition hover:bg-white hover:text-neutral-950"
                >
                  HABLAR CON VENTAS
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <WholesalePoint number="01" title="Equipos" text="Compra para entrenamiento o competencia." />
              <WholesalePoint number="02" title="Academias" text="Condiciones pensadas para formación." />
              <WholesalePoint number="03" title="Comercios" text="Precios especiales para reventa." />
              <WholesalePoint number="04" title="Volumen" text="Mejor precio según cantidad." />
            </div>
          </div>
        </div>
      </section>

      <StoreFooter settings={data.settings} paymentMethods={data.paymentMethods} />
    </main>
  );
}

function WhyBuyCard({
  icon,
  title,
  text,
}: {
  icon: "shipping" | "support" | "price" | "wholesale";
  title: string;
  text: string;
}) {
  return (
    <div className="group flex min-h-[250px] flex-col items-center justify-center border-b border-r border-neutral-200 bg-neutral-50/70 px-5 py-8 text-center transition duration-300 hover:bg-white sm:min-h-[285px] sm:px-7">
      <div className="flex h-14 w-14 items-center justify-center text-neutral-400 transition duration-300 group-hover:-translate-y-1 group-hover:text-emerald-600">
        {icon === "shipping" && (
          <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth="1.7">
            <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
        )}
        {icon === "support" && (
          <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth="1.7">
            <path d="M5 5h14v11H9l-4 3z" />
            <path d="M8 9h8M8 12h5" />
          </svg>
        )}
        {icon === "price" && (
          <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M15 8.5c-.7-.5-1.6-.8-2.7-.8-1.7 0-2.8.8-2.8 2 0 3.1 5.8 1.4 5.8 4.6 0 1.2-1.1 2-2.9 2-1.2 0-2.3-.3-3.2-.9M12 5.8v12.4" />
          </svg>
        )}
        {icon === "wholesale" && (
          <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth="1.7">
            <path d="M4 7h16v12H4zM7 7V5h10v2M8 11h8M8 15h5" />
          </svg>
        )}
      </div>
      <h3 className="mt-5 max-w-[190px] text-xl font-black leading-[1.05] tracking-[-0.025em] sm:text-2xl">{title}</h3>
      <p className="mt-4 max-w-[220px] text-sm leading-5 text-neutral-500 sm:text-[15px] sm:leading-6">{text}</p>
    </div>
  );
}

function ShippingCard({ name, text }: { name: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-emerald-950/10 bg-white/85 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xl font-black tracking-[-0.03em] text-neutral-950">{name}</span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-800">Gratis</span>
      </div>
      <p className="mt-4 text-xs leading-5 text-neutral-600">{text}</p>
    </div>
  );
}

function WholesalePoint({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
      <span className="text-[10px] font-black text-emerald-400">{number}</span>
      <p className="mt-4 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
    </div>
  );
}
