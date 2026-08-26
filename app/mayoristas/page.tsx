import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import StoreFooter from "@/components/StoreFooter";
import StoreHeader from "@/components/StoreHeader";
import { getCatalogSnapshot } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function WholesalePage() {
  let data = fallbackCatalog;
  try {
    data = await getCatalogSnapshot();
  } catch {
    // Mantiene la página disponible si la base de datos está temporalmente fuera de línea.
  }

  const wholesaleProducts = data.products.filter((product) => product.wholesaleEnabled);
  const whatsappHref = `https://wa.me/${data.settings.whatsappPhone}?text=${encodeURIComponent(
    "Hola, LCDS Sports. Quiero comprar al mayor y necesito información sobre precios por cantidad.",
  )}`;

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StoreHeader settings={data.settings} />

      <section className="mx-auto max-w-7xl px-4 pt-5 lg:px-8 lg:pt-7">
        <div className="relative overflow-hidden rounded-[34px] bg-neutral-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14 lg:py-20">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[56px] border-emerald-500/[0.08]" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-emerald-500/[0.08] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full border-[44px] border-white/[0.03]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                LCDS Mayoristas
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Compra más. <span className="text-emerald-400">Paga mejor.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
                Una experiencia especial para equipos, academias, comercios y revendedores. Precios por cantidad, atención directa y despacho nacional.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-emerald-400">
                  SOLICITAR PRECIO MAYORISTA
                </a>
                <Link href="/#productos" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-black transition hover:bg-white hover:text-neutral-950">
                  VER CATÁLOGO
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroMetric value="USD" label="Precio mayorista" />
              <HeroMetric value="Bs." label="Calculado con tasa vigente" />
              <HeroMetric value="ZOOM" label="Envío gratis" />
              <HeroMetric value="TEALCA" label="Envío gratis" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-4 lg:grid-cols-4">
          <AudienceCard title="Equipos" text="Abastece entrenamientos, torneos y temporadas completas." />
          <AudienceCard title="Academias" text="Compra por volumen con una estructura clara y atención personalizada." />
          <AudienceCard title="Comercios" text="Accede a mejores condiciones para reventa según cantidad." />
          <AudienceCard title="Revendedores" text="Consulta escalas y disponibilidad antes de cerrar tu pedido." />
        </div>
      </section>

      <section className="border-y border-neutral-100 bg-neutral-50/70">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
          <div className="mb-6 max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Precios por volumen</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Escalas mayoristas por producto</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Cada producto puede tener su propia escala. El precio se muestra en USD y el monto en Bs. se calcula automáticamente con la tasa configurada internamente.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {wholesaleProducts.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-[26px] border border-neutral-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-50">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain p-2" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">{product.brand}</p>
                    <h3 className="mt-1 text-lg font-black leading-6">{product.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">{product.wholesaleNote || data.settings.wholesaleText}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {product.wholesaleTiers.length > 0 ? (
                    product.wholesaleTiers.map((tier) => (
                      <div key={tier.id} className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 px-4 py-4">
                        <div>
                          <p className="text-sm font-black">{tier.label || `Desde ${tier.minQuantity} unidades`}</p>
                          <p className="mt-1 text-xs font-semibold text-neutral-500">{formatBs(calculateBcvBs(tier.bcvReferenceUsd, data.rateBcv))}</p>
                        </div>
                        <p className="text-xl font-black tracking-tight">{formatUsd(tier.priceUsd)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-neutral-200 p-4 text-sm font-semibold text-neutral-500">
                      Precio especial disponible por cantidad. Consulta con ventas.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/producto/${product.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-xs font-black transition hover:border-neutral-950">
                    VER PRODUCTO
                  </Link>
                  <a
                    href={`https://wa.me/${data.settings.whatsappPhone}?text=${encodeURIComponent(`Hola, LCDS Sports. Quiero precio al mayor para ${product.name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-xs font-black text-white transition hover:bg-emerald-500 hover:text-neutral-950"
                  >
                    COTIZAR
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Así funciona</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Una compra mayorista sin vueltas.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500">
              No necesitas llenar formularios interminables. Revisas el catálogo, eliges cantidades y coordinamos contigo directamente.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Step number="01" title="Selecciona" text="Escoge los productos que necesitas." />
            <Step number="02" title="Cotiza" text="Indica cantidades y recibe la condición correspondiente." />
            <Step number="03" title="Despachamos" text="Confirmamos pago y coordinamos Zoom o Tealca." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8 lg:pb-16">
        <div className="relative overflow-hidden rounded-[30px] bg-emerald-500 p-6 sm:p-9 lg:p-12">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950/70">Atención comercial</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">¿Tienes una compra grande en mente?</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-950/80">Cuéntanos qué necesitas y preparamos contigo la mejor combinación de productos y cantidades.</p>
            </div>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-neutral-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5">
              HABLAR CON MAYORISTAS
            </a>
          </div>
        </div>
      </section>

      {wholesaleProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8 lg:pb-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">También puedes comprar al detal</p>
              <h2 className="mt-1 text-2xl font-black">Explora nuestros productos</h2>
            </div>
            <Link href="/#productos" className="text-xs font-black text-neutral-500">Ver catálogo →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {wholesaleProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} rateBcv={data.rateBcv} />
            ))}
          </div>
        </section>
      )}

      <StoreFooter settings={data.settings} paymentMethods={data.paymentMethods} />
    </main>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="text-xl font-black tracking-tight text-emerald-400">{value}</p>
      <p className="mt-2 text-xs leading-5 text-neutral-400">{label}</p>
    </div>
  );
}

function AudienceCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="group rounded-[24px] border border-neutral-200 bg-neutral-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
      <div className="mb-5 h-1 w-9 rounded-full bg-emerald-500 transition-all duration-300 group-hover:w-14" />
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-[22px] bg-neutral-950 p-5 text-white">
      <span className="text-[10px] font-black text-emerald-400">{number}</span>
      <h3 className="mt-5 text-lg font-black">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-neutral-400">{text}</p>
    </div>
  );
}
