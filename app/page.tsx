import Image from "next/image";
import { getCatalogSnapshot } from "@/lib/catalog";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const categories = ["Pelotas", "Guantes", "Bates", "Protección", "Entrenamiento", "Accesorios"];

const fallback = {
  rateBcv: 250,
  products: [
    {
      id: 1,
      name: "Pelota Softball SB-120I",
      slug: "pelota-softball-tamanaco-sb-120i",
      brand: "Tamanaco",
      subtitle: "Importada · Bolsa Chillona",
      image: "/products/tamanaco-sb120i.png",
      badge: "Más vendida",
      priceUsd: 7,
      bcvReferenceUsd: 9.5,
      stock: 50,
      featured: true,
    },
    {
      id: 2,
      name: "Pack 3 SB-120I",
      slug: "pack-3-tamanaco-sb-120i",
      brand: "Tamanaco",
      subtitle: "3 unidades",
      image: "/products/tamanaco-pack3.png",
      badge: "Pack 3",
      priceUsd: 38,
      bcvReferenceUsd: 42,
      stock: 20,
      featured: false,
    },
  ],
};

export default async function Home() {
  let data = fallback;
  try {
    data = await getCatalogSnapshot();
  } catch {
    // Mantiene la tienda visible si DATABASE_URL aún no está disponible.
  }

  const featured = data.products.find((product) => product.featured) ?? data.products[0];

  return (
    <main className="min-h-screen bg-white pb-24 text-neutral-950 md:pb-0">
      <div className="bg-neutral-950 px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-white">
        ENVÍOS A TODA VENEZUELA 🇻🇪
      </div>

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="relative h-11 w-[115px] sm:w-[135px]">
            <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="135px" priority className="object-contain object-left" />
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#">Inicio</a><a href="#productos">Catálogo</a><a href="#mayor">Mayoristas</a>
          </nav>
          <a href="/admin" className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold">ADMIN</a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4">
          <span>⌕</span><input type="search" placeholder="Buscar pelotas, guantes, Tamanaco..." className="min-w-0 flex-1 bg-transparent text-base outline-none" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 text-white">
          <div className="grid min-h-[470px] md:min-h-[430px] md:grid-cols-2">
            <div className="relative z-10 flex flex-col justify-center px-6 pb-5 pt-8 sm:px-8 md:px-10 md:py-12">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-green-500">LCDS SPORTS · VENEZUELA</p>
              <h1 className="max-w-md text-[40px] font-black uppercase leading-[0.88] tracking-[-0.045em] sm:text-5xl lg:text-6xl">La Casa del <span className="text-green-500">Softball</span></h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-neutral-300 sm:text-base">Pelotas, equipamiento y artículos deportivos para jugadores, equipos, academias y comercios.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#productos" className="flex min-h-12 items-center rounded-xl bg-green-600 px-5 text-sm font-black">VER PRODUCTOS</a>
                <a href="#mayor" className="flex min-h-12 items-center rounded-xl border border-white/20 px-5 text-sm font-bold">COMPRAR AL MAYOR</a>
              </div>
            </div>
            <div className="relative flex min-h-[220px] items-center justify-center p-5">
              <div className="relative h-[240px] w-[290px] md:h-[340px] md:w-[400px]">
                <Image src={featured?.image ?? "/products/tamanaco-sb120i.png"} alt={featured?.name ?? "Pelota Tamanaco"} fill sizes="(max-width: 767px) 290px, 400px" priority className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-7">
        <div className="mb-4 flex items-center justify-between px-4 lg:px-8"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-700">Explora</p><h2 className="mt-1 text-xl font-black">Categorías</h2></div><span className="text-sm font-bold text-green-700">Ver todas</span></div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 lg:px-8">{categories.map((category) => <span key={category} className="min-h-11 shrink-0 rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold">{category}</span>)}</div>
      </section>

      {featured && (
        <section className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="overflow-hidden rounded-[28px] bg-neutral-100 md:grid md:grid-cols-2 md:items-center">
            <div className="relative aspect-square bg-white"><Image src={featured.image ?? "/products/tamanaco-sb120i.png"} alt={featured.name} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-contain p-8" /></div>
            <div className="p-6 md:p-10">
              <span className="rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-black uppercase text-green-800">Nuestra pelota top</span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">{featured.brand}</p>
              <h2 className="mt-1 text-3xl font-black">{featured.name}</h2>
              <p className="mt-2 text-sm text-neutral-600">{featured.subtitle}</p>
              <div className="mt-6 border-t border-neutral-200 pt-5">
                <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                  <p className="text-4xl font-black">{formatUsd(featured.priceUsd)}</p>
                  <div><p className="text-[9px] font-black uppercase text-neutral-400">Pago en Bs.</p><p className="text-lg font-black text-neutral-700">{formatBs(calculateBcvBs(featured.bcvReferenceUsd, data.rateBcv))}</p></div>
                </div>
                <p className="mt-3 text-xs text-neutral-500">Divisas: Zelle · USDT · efectivo · depósito bancario</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="productos" className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
        <div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-700">Selección LCDS</p><h2 className="mt-1 text-2xl font-black">Más vendidos</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="relative aspect-square bg-neutral-50"><span className="absolute left-2 top-2 z-10 rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-black uppercase text-white">{product.badge}</span><Image src={product.image ?? "/products/tamanaco-sb120i.png"} alt={product.name} fill sizes="(max-width: 767px) 50vw, 25vw" className="object-contain p-3" /></div>
              <div className="p-3 sm:p-4"><p className="text-[9px] font-black uppercase text-neutral-400">{product.brand}</p><h3 className="mt-1 text-sm font-black sm:text-base">{product.name}</h3><p className="mt-1 truncate text-[11px] text-neutral-500">{product.subtitle}</p><div className="mt-4 flex flex-wrap items-baseline gap-x-2"><p className="text-xl font-black">{formatUsd(product.priceUsd)}</p><p className="text-xs font-bold text-neutral-600">{formatBs(calculateBcvBs(product.bcvReferenceUsd, data.rateBcv))}</p></div><p className="mt-1 text-[9px] text-neutral-400">Bs. calculados según tasa vigente</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="mayor" className="mx-auto max-w-7xl px-4 pb-9 lg:px-8"><div className="rounded-[28px] bg-green-600 p-6 text-white md:p-10"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-950">Ventas al mayor</p><h2 className="mt-2 text-3xl font-black">Mientras más llevas, mejor es tu precio.</h2><p className="mt-3 text-sm text-green-950/80">Condiciones especiales para equipos, academias, comercios y revendedores.</p></div></section>

      <footer className="border-t border-neutral-200 bg-neutral-50"><div className="mx-auto max-w-7xl px-4 py-8 text-xs text-neutral-500 lg:px-8">© 2026 LCDS Sports · Portuguesa, Venezuela</div></footer>
    </main>
  );
}
