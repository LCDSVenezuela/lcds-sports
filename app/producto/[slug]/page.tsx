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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let snapshot = fallbackCatalog;
  let product = fallbackCatalog.products.find((item) => item.slug === slug) ?? null;
  try {
    const result = await getProductBySlug(slug);
    snapshot = result;
    product = result.product;
  } catch {}
  if (!product) notFound();
  const bsPrice = calculateBcvBs(product.bcvReferenceUsd, snapshot.rateBcv);
  const related = snapshot.products.filter((item) => item.id !== product.id).slice(0, 4);
  const paymentNames = snapshot.paymentMethods.map((method) => method.name).join(" · ");

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StoreHeader settings={snapshot.settings} />
      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-4 lg:px-8 lg:pb-20 lg:pt-6">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-400">
          <Link href="/" className="transition hover:text-neutral-950">Inicio</Link><span>/</span>
          <Link href="/#productos" className="transition hover:text-neutral-950">{product.category}</Link><span>/</span>
          <span className="max-w-[240px] truncate text-neutral-600">{product.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(390px,0.88fr)] lg:gap-14 xl:gap-16">
          <div className="lg:sticky lg:top-[104px] lg:self-start">
            <ProductGallery images={product.images} fallbackImage={product.image} productName={product.name} />
          </div>
          <aside className="min-w-0 lg:pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <RatingStars rating={product.rating} count={product.reviewCount} />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">{product.brand}</span>
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-[0.98] tracking-[-0.045em] sm:text-[42px] lg:text-[48px]">{product.name}</h1>
            {product.subtitle && <p className="mt-4 text-sm font-medium leading-6 text-neutral-500 sm:text-base">{product.subtitle}</p>}
            {(product.badge || product.labels.length > 0) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.badge && <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">{product.badge}</span>}
                {product.labels.map((label) => <span key={label} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-neutral-600">{label}</span>)}
              </div>
            )}
            <div className="mt-7 border-y border-neutral-200 py-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Precio</p><p className="mt-1 text-4xl font-black tracking-[-0.045em] sm:text-[44px]">{formatUsd(product.priceUsd)}</p></div>
                <div className="text-right"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">En bolívares</p><p className="mt-1 text-xl font-black text-neutral-800">{formatBs(bsPrice)}</p><p className="mt-1 text-[10px] font-semibold text-neutral-400">Tasa vigente</p></div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-neutral-300"}`} /><span className="text-sm font-black">{product.stock > 0 ? "Disponible" : "Agotado"}</span>{product.stock > 0 && <span className="text-xs font-semibold text-neutral-400">· {product.stock} unidades</span>}</div>
              {product.sku && <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">SKU {product.sku}</span>}
            </div>
            <div className="mt-6">
              <WhatsAppOrderButton productName={product.name} sku={product.sku} priceUsd={product.priceUsd} bcvReferenceUsd={product.bcvReferenceUsd} rateBcv={snapshot.rateBcv} phone={snapshot.settings.whatsappPhone} paymentMethods={snapshot.paymentMethods} stock={product.stock} wholesaleEnabled={product.wholesaleEnabled} wholesaleTiers={product.wholesaleTiers} freeShipping={product.freeShipping} />
            </div>
            <div className="mt-7 divide-y divide-neutral-200 border-y border-neutral-200">
              <details className="group py-4" open><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black"><span>Envío</span><span className="text-lg font-light text-neutral-400 transition group-open:rotate-45">+</span></summary><p className="mt-3 pr-8 text-sm leading-6 text-neutral-500">{product.freeShipping ? "Envío gratis por Zoom o Tealca a toda Venezuela." : snapshot.settings.shippingText}</p></details>
              <details className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black"><span>Métodos de pago</span><span className="text-lg font-light text-neutral-400 transition group-open:rotate-45">+</span></summary><p className="mt-3 pr-8 text-sm leading-6 text-neutral-500">{paymentNames || "Consulta los métodos disponibles por WhatsApp."}</p></details>
              <details className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black"><span>Garantía, cambios y reembolsos</span><span className="text-lg font-light text-neutral-400 transition group-open:rotate-45">+</span></summary><div className="mt-3 pr-8 text-sm leading-6 text-neutral-500"><p>Garantía indicada para este producto: {product.warrantyDays} día(s).</p><div className="mt-2 flex flex-wrap gap-3 text-xs font-black"><Link href="/politicas" className="text-neutral-950 underline decoration-neutral-300 underline-offset-4">Políticas</Link><Link href="/reembolsos" className="text-neutral-950 underline decoration-neutral-300 underline-offset-4">Cambios y reembolsos</Link></div></div></details>
            </div>
          </aside>
        </section>

        <section className="mt-14 grid border-l border-t border-neutral-200 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          <ProductMeta label="Marca" value={product.brand} /><ProductMeta label="Categoría" value={product.category} /><ProductMeta label="Condición" value="Nuevo" /><ProductMeta label="Garantía" value={`${product.warrantyDays} día(s)`} />
        </section>

        <section className="grid gap-8 border-b border-neutral-200 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:py-20">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Producto</p><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Descripción</h2></div>
          <div><p className="max-w-3xl text-base leading-8 text-neutral-600 sm:text-lg">{product.description || product.subtitle || "Consulta con nuestro equipo para más información sobre este producto."}</p>{product.labels.length > 0 && <div className="mt-7 flex flex-wrap gap-2">{product.labels.map((label) => <span key={label} className="rounded-full bg-neutral-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-600">{label}</span>)}</div>}</div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="mb-7"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Compra y entrega</p><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Todo lo importante, en un solo lugar.</h2></div>
          <div className="grid gap-3 md:grid-cols-3">
            <PurchaseCard title="Envío nacional" text={product.freeShipping ? "Zoom o Tealca gratis a toda Venezuela." : snapshot.settings.shippingText} />
            <PurchaseCard title="Pago flexible" text={paymentNames || "Métodos disponibles al confirmar tu pedido."} />
            <PurchaseCard title="Atención directa" text="Tu pedido se confirma por WhatsApp antes del despacho." />
          </div>
        </section>

        {product.wholesaleEnabled && (
          <section id="mayor" className="overflow-hidden rounded-[30px] bg-neutral-950 p-6 text-white sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Precio por volumen</p><h2 className="mt-2 max-w-xl text-3xl font-black leading-[1.02] tracking-[-0.035em] sm:text-4xl">Compra más, paga mejor.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">{product.wholesaleNote || snapshot.settings.wholesaleText}</p><Link href="/mayoristas" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-xs font-black transition hover:bg-white hover:text-neutral-950">VER VENTAS AL MAYOR</Link></div>
              <div className="space-y-2">{product.wholesaleTiers.length ? product.wholesaleTiers.map((tier) => <div key={tier.id} className="flex items-center justify-between gap-5 rounded-2xl bg-white px-4 py-4 text-neutral-950 sm:px-5"><div><p className="text-sm font-black">{tier.label || `Desde ${tier.minQuantity} unidades`}</p><p className="mt-1 text-xs font-semibold text-neutral-500">{formatBs(calculateBcvBs(tier.bcvReferenceUsd, snapshot.rateBcv))} c/u en Bs.</p></div><p className="text-2xl font-black tracking-[-0.03em]">{formatUsd(tier.priceUsd)}</p></div>) : <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm font-semibold text-neutral-300">Consulta por WhatsApp el precio según cantidad.</div>}</div>
            </div>
          </section>
        )}

        {related.length > 0 && <section className="mt-14 lg:mt-20"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">También te puede interesar</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Productos relacionados</h2></div><Link href="/#productos" className="text-xs font-black text-neutral-500 transition hover:text-neutral-950">Ver catálogo →</Link></div><div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} rateBcv={snapshot.rateBcv} />)}</div></section>}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur-xl lg:hidden"><a href="#comprar" className="flex min-h-12 items-center justify-between rounded-full bg-neutral-950 px-5 text-white"><span className="text-sm font-black">Pedir producto</span><span className="text-sm font-black text-emerald-400">{formatUsd(product.priceUsd)} →</span></a></div>
      <StoreFooter settings={snapshot.settings} paymentMethods={snapshot.paymentMethods} />
    </main>
  );
}

function ProductMeta({ label, value }: { label: string; value: string }) { return <div className="border-b border-r border-neutral-200 bg-white px-5 py-6 sm:px-6 lg:py-7"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">{label}</p><p className="mt-2 text-base font-black text-neutral-950">{value}</p></div>; }
function PurchaseCard({ title, text }: { title: string; text: string }) { return <article className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5 sm:p-6"><div className="h-2 w-8 rounded-full bg-emerald-400" /><h3 className="mt-5 text-lg font-black tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p></article>; }
