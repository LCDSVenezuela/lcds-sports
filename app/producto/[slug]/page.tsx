import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import RatingStars from "@/components/RatingStars";
import StoreFooter from "@/components/StoreFooter";
import StoreHeader from "@/components/StoreHeader";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";
import { getProductBySlug } from "@/lib/catalog";
import { fallbackCatalog } from "@/lib/fallback";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let snapshot = fallbackCatalog;
  let product = fallbackCatalog.products.find((item) => item.slug === slug) ?? null;

  try {
    const result = await getProductBySlug(slug);
    snapshot = result;
    product = result.product;
  } catch {
    // Mantiene la ficha disponible si la base de datos está temporalmente fuera de línea.
  }

  if (!product) notFound();

  const bsPrice = calculateBcvBs(product.bcvReferenceUsd, snapshot.rateBcv);
  const related = snapshot.products.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StoreHeader settings={snapshot.settings} />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 lg:px-8 lg:pb-16">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-400">
          <Link href="/" className="transition hover:text-neutral-950">Inicio</Link>
          <span>/</span>
          <Link href="/#productos" className="transition hover:text-neutral-950">{product.category}</Link>
          <span>/</span>
          <span className="max-w-[220px] truncate text-neutral-600">{product.name}</span>
        </nav>

        <section className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12">
          <ProductGallery images={product.images} fallbackImage={product.image} productName={product.name} />

          <div className="lg:pt-2">
            <div className="flex flex-wrap gap-2">
              {product.badge && (
                <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">{product.badge}</span>
              )}
              {product.labels.map((label) => (
                <span key={label} className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">{label}</span>
              ))}
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-black leading-[1.02] tracking-[-0.035em] sm:text-4xl lg:text-[42px]">{product.name}</h1>
            {product.subtitle && <p className="mt-3 text-sm leading-6 text-neutral-500 sm:text-base">{product.subtitle}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <RatingStars rating={product.rating} count={product.reviewCount} />
              {product.sku && <span className="text-xs font-semibold text-neutral-400">SKU {product.sku}</span>}
            </div>

            <div className="mt-7 overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.045)]">
              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">Precio en USD</p>
                <p className="mt-1 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{formatUsd(product.priceUsd)}</p>
              </div>
              <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Precio en Bs.</p>
                    <p className="mt-1 text-xl font-black text-neutral-800">{formatBs(bsPrice)}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 shadow-sm">Tasa vigente</span>
                </div>
                <p className="mt-3 max-w-lg text-[11px] leading-5 text-neutral-500">
                  El monto en Bs. se calcula automáticamente con la referencia interna configurada para este producto y la tasa vigente de LCDS Sports.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoPill label="Disponibilidad" value={product.stock > 0 ? `${product.stock} disponibles` : "Agotado"} positive={product.stock > 0} />
              <InfoPill label="Envío" value={product.freeShipping ? "Gratis por Zoom y Tealca" : "Consultar condiciones"} positive={product.freeShipping} />
            </div>

            {product.freeShipping && (
              <div className="mt-4 flex items-center gap-4 rounded-[20px] bg-emerald-500 p-4 text-neutral-950">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-emerald-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
                </div>
                <div>
                  <p className="text-sm font-black">Envío gratis nacional</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-950/75">Puedes coordinar tu despacho por Zoom o Tealca al confirmar el pedido.</p>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-neutral-200 pt-6">
              <WhatsAppOrderButton
                productName={product.name}
                sku={product.sku}
                priceUsd={product.priceUsd}
                bcvReferenceUsd={product.bcvReferenceUsd}
                rateBcv={snapshot.rateBcv}
                phone={snapshot.settings.whatsappPhone}
                paymentMethods={snapshot.paymentMethods}
                stock={product.stock}
              />
            </div>

            <div className="mt-6 rounded-[22px] border border-neutral-200 p-4 sm:p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Métodos de pago</p>
                  <p className="mt-1 text-sm font-black">Elige el que te resulte más cómodo</p>
                </div>
                <span className="text-[10px] font-bold text-neutral-400">Al confirmar</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {snapshot.paymentMethods.map((method) => (
                  <span key={method.id} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 text-[11px] font-black text-neutral-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {method.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[28px] border border-neutral-200 p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Información del producto</p>
            <h2 className="mt-2 text-2xl font-black">Descripción y detalles</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">{product.description || product.subtitle || "Consulta con nuestro equipo para más información."}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <DetailRow label="Marca" value={product.brand} />
              <DetailRow label="Categoría" value={product.category} />
              <DetailRow label="Condición" value="Nuevo" />
              <DetailRow label="Garantía" value={`${product.warrantyDays} día(s) de garantía`} />
            </div>
          </div>

          <div className="rounded-[28px] bg-neutral-950 p-6 text-white sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Compra tranquila</p>
            <h2 className="mt-2 text-2xl font-black">Todo claro antes de pagar</h2>
            <div className="mt-6 space-y-4">
              <ConfidenceItem title="Stock visible" text={product.stock > 0 ? "Producto disponible para coordinar pedido." : "Actualmente agotado."} />
              <ConfidenceItem title="Precio definido" text="Ves el precio en USD y el monto calculado en Bs. antes de escribirnos." />
              <ConfidenceItem title="Despacho coordinado" text={product.freeShipping ? "Envío gratis por Zoom y Tealca." : snapshot.settings.shippingText} />
            </div>
          </div>
        </section>

        {product.wholesaleEnabled && (
          <section id="mayor" className="mt-6 overflow-hidden rounded-[28px] bg-emerald-500 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-7 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950/70">Ventas al mayor</p>
                <h2 className="mt-2 max-w-xl text-3xl font-black leading-[1.02] tracking-tight text-neutral-950">{snapshot.settings.wholesaleTitle}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-950/80">{product.wholesaleNote || snapshot.settings.wholesaleText}</p>
                <Link href="/mayoristas" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-xs font-black text-white transition hover:-translate-y-0.5">
                  VER PÁGINA MAYORISTA
                </Link>
              </div>

              <div className="space-y-2">
                {product.wholesaleTiers.length ? (
                  product.wholesaleTiers.map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/85 px-4 py-4 backdrop-blur-sm">
                      <div>
                        <p className="text-sm font-black">{tier.label || `Desde ${tier.minQuantity} unidades`}</p>
                        <p className="mt-1 text-xs text-neutral-500">{formatBs(calculateBcvBs(tier.bcvReferenceUsd, snapshot.rateBcv))} en Bs.</p>
                      </div>
                      <p className="text-xl font-black">{formatUsd(tier.priceUsd)}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/85 p-5 text-sm font-semibold text-neutral-700">Consulta por WhatsApp para recibir precio especial según cantidad.</div>
                )}
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">También te puede interesar</p>
                <h2 className="mt-1 text-2xl font-black">Productos relacionados</h2>
              </div>
              <Link href="/#productos" className="text-xs font-black text-neutral-500">Ver catálogo →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => <ProductCard key={item.id} product={item} rateBcv={snapshot.rateBcv} />)}
            </div>
          </section>
        )}
      </div>

      <StoreFooter settings={snapshot.settings} paymentMethods={snapshot.paymentMethods} />
    </main>
  );
}

function InfoPill({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-[20px] border border-neutral-200 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <p className={`mt-1 text-sm font-black ${positive ? "text-emerald-700" : "text-neutral-800"}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 px-4 py-3">
      <span className="text-xs font-semibold text-neutral-400">{label}</span>
      <span className="text-right text-sm font-black text-neutral-800">{value}</span>
    </div>
  );
}

function ConfidenceItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <p className="text-sm font-black">{title}</p>
      </div>
      <p className="mt-2 pl-4 text-xs leading-5 text-neutral-400">{text}</p>
    </div>
  );
}
