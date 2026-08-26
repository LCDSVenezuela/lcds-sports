import {
  calculateBcvBs,
  formatBs,
  formatUsd,
} from "@/lib/pricing";
import Image from "next/image";

const categories = [
  "Pelotas",
  "Guantes",
  "Bates",
  "Protección",
  "Entrenamiento",
  "Accesorios",
];

const products = [
  {
    id: 1,
    brand: "Tamanaco",
    name: "Pelota Softball SB-120I",
    subtitle: "Importada · Bolsa Chillona",
    image: "/products/tamanaco-sb120i.png",
    priceUsd: 7,
    bcvReferenceUsd: 9.5,
    badge: "Más vendida",
  },
  {
    id: 2,
    brand: "Tamanaco",
    name: "Pack 3 SB-120I",
    subtitle: "3 unidades",
    image: "/products/tamanaco-pack3.png",
    priceUsd: 38,
    bcvReferenceUsd: 42,
    badge: "Pack 3",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white pb-24 text-neutral-950 md:pb-0">
      {/* TOP BAR */}
      <div className="bg-neutral-950 px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-white">
        ENVÍOS A TODA VENEZUELA 🇻🇪
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="relative h-11 w-[115px] sm:w-[135px]">
            <Image
              src="/brand/lcds-logo.png"
              alt="LCDS Sports"
              fill
              sizes="(max-width: 640px) 115px, 135px"
              priority
              className="object-contain object-left"
            />
          </div>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#" className="hover:text-green-700">
              Inicio
            </a>
            <a href="#productos" className="hover:text-green-700">
              Catálogo
            </a>
            <a href="#mayor" className="hover:text-green-700">
              Mayoristas
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Buscar"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-50"
            >
              <SearchIcon />
            </button>

            <button
              aria-label="Pedido"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-50"
            >
              <BagIcon />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-black text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH */}
      <section className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4">
          <SearchIcon />

          <input
            type="search"
            placeholder="Buscar pelotas, guantes, Tamanaco..."
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-400"
          />
        </div>
      </section>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 text-white">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.20),transparent_65%)]" />

          <div className="grid min-h-[470px] md:min-h-[430px] md:grid-cols-2">
            {/* HERO CONTENT */}
            <div className="relative z-10 flex flex-col justify-center px-6 pb-5 pt-8 sm:px-8 md:px-10 md:py-12">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-green-500">
                LCDS SPORTS · VENEZUELA
              </p>

              <h1 className="max-w-md text-[40px] font-black uppercase leading-[0.88] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                La Casa del{" "}
                <span className="text-green-500">Softball</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-neutral-300 sm:text-base">
                Pelotas, equipamiento y artículos deportivos para jugadores,
                equipos, academias y comercios.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#productos"
                  className="flex min-h-12 items-center justify-center rounded-xl bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700"
                >
                  VER PRODUCTOS
                </a>

                <a
                  href="#mayor"
                  className="flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold transition hover:bg-white/5"
                >
                  COMPRAR AL MAYOR
                </a>
              </div>
            </div>

            {/* HERO PRODUCT */}
            <div className="relative flex min-h-[220px] items-end justify-center overflow-hidden px-5 md:min-h-0 md:items-center">
              <div className="absolute h-52 w-52 rounded-full bg-green-600/20 blur-3xl md:h-72 md:w-72" />

              <div className="relative h-[220px] w-[270px] sm:h-[250px] sm:w-[310px] md:h-[330px] md:w-[390px]">
                <Image
                  src="/products/tamanaco-sb120i.png"
                  alt="Pelota Softball Tamanaco SB-120I"
                  fill
                  sizes="(max-width: 767px) 270px, 390px"
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl py-7">
        <div className="mb-4 flex items-center justify-between px-4 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-700">
              Explora
            </p>
            <h2 className="mt-1 text-xl font-black">Categorías</h2>
          </div>

          <button className="text-sm font-bold text-green-700">
            Ver todas
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-2 lg:px-8">
          {categories.map((category) => (
            <button
              key={category}
              className="min-h-11 shrink-0 rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold transition hover:border-neutral-950"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCT */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-neutral-100 md:grid md:grid-cols-2 md:items-center">
          <div className="relative aspect-square bg-white">
            <Image
              src="/products/tamanaco-sb120i.png"
              alt="Tamanaco SB-120I"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-contain p-7 sm:p-10"
            />
          </div>

          <div className="p-6 md:p-10">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-green-800">
              Nuestra pelota top
            </span>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
              Tamanaco
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              SB-120I
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Pelota de softball importada · Bolsa Chillona
            </p>

            {/* PRECIOS */}
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
                Precio
              </p>

              <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-3">
                <p className="text-4xl font-black tracking-tight text-neutral-950">
                  {formatUsd(7)}
                </p>

                <div className="pb-0.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">
                    Pago en Bs.
                  </p>
                  <p className="text-lg font-black text-neutral-700">
                    {formatBs(calculateBcvBs(9.5))}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-neutral-500">
                Divisas: Zelle · USDT · efectivo · depósito bancario
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                El monto en bolívares se calcula automáticamente según la tasa vigente.
              </p>
            </div>

            <button className="mt-6 min-h-12 w-full rounded-xl bg-neutral-950 px-5 text-sm font-black text-white transition hover:bg-neutral-800 sm:w-auto">
              VER PRODUCTO
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section
        id="productos"
        className="mx-auto max-w-7xl px-4 py-9 lg:px-8"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-700">
              Selección LCDS
            </p>

            <h2 className="mt-1 text-2xl font-black">Más vendidos</h2>
          </div>

          <button className="text-sm font-bold">Ver todos</button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-50">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                  {product.badge}
                </span>

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-3 sm:p-4">
                <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">
                  {product.brand}
                </p>

                <h3 className="mt-1 text-sm font-black leading-5 sm:text-base">
                  {product.name}
                </h3>

                <p className="mt-1 truncate text-[11px] text-neutral-500">
                  {product.subtitle}
                </p>

                <div className="mt-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-xl font-black tracking-tight text-neutral-950 sm:text-2xl">
                      {formatUsd(product.priceUsd)}
                    </p>

                    <p className="text-xs font-bold text-neutral-600 sm:text-sm">
                      {formatBs(calculateBcvBs(product.bcvReferenceUsd))}
                    </p>
                  </div>

                  <p className="mt-1 text-[9px] leading-4 text-neutral-400">
                    Precio en divisas · Bs. según tasa vigente
                  </p>
                </div>

                <button className="mt-4 min-h-11 w-full rounded-xl border border-neutral-950 text-xs font-black transition hover:bg-neutral-950 hover:text-white">
                  VER PRODUCTO
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WHOLESALE */}
      <section
        id="mayor"
        className="mx-auto max-w-7xl px-4 pb-9 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-[28px] bg-green-600 p-6 text-white md:p-10">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full border-[28px] border-green-950/10" />

          <div className="relative z-10 max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-950">
              Ventas al mayor
            </p>

            <h2 className="mt-2 text-3xl font-black leading-[1.05] sm:text-4xl">
              Mientras más llevas, mejor es tu precio.
            </h2>

            <p className="mt-3 text-sm leading-6 text-green-950/80">
              Condiciones especiales para equipos, academias, comercios y
              revendedores.
            </p>

            <button className="mt-5 min-h-12 rounded-xl bg-neutral-950 px-5 text-sm font-black text-white">
              VER PRECIOS MAYORISTAS
            </button>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pb-10 lg:grid-cols-4 lg:px-8">
        <Benefit
          title="Envíos nacionales"
          text="Despachos a toda Venezuela"
        />

        <Benefit
          title="Compra asistida"
          text="Atención directa por WhatsApp"
        />

        <Benefit
          title="Precio mayor"
          text="Escalas especiales por cantidad"
        />

        <Benefit
          title="Divisas + Bs."
          text="USD principal y monto actualizado en bolívares"
        />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="relative h-12 w-32">
            <Image
              src="/brand/lcds-logo.png"
              alt="LCDS Sports"
              fill
              sizes="128px"
              className="object-contain object-left"
            />
          </div>

          <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
            La Casa del Softball. Equipamiento y artículos deportivos con
            envíos a toda Venezuela.
          </p>

          <p className="mt-6 text-xs text-neutral-400">
            © 2026 LCDS Sports. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 px-2 pb-2 pt-1 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <MobileNav icon={<HomeIcon />} label="Inicio" />
          <MobileNav icon={<SearchIcon />} label="Buscar" />
          <MobileNav icon={<BallIcon />} label="Catálogo" />
          <MobileNav icon={<BagIcon />} label="Pedido" />
          <MobileNav icon={<ChatIcon />} label="WhatsApp" />
        </div>
      </nav>
    </main>
  );
}

function Benefit({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3 h-1 w-8 rounded-full bg-green-600" />

      <h3 className="text-sm font-black">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
    </article>
  );
}

function MobileNav({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold">
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10" />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 6.5c3 2 10 9 13 11" />
      <path d="M18.5 6.5c-3 2-10 9-13 11" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    > 
      <path d="M21 12a8 8 0 0 1-8 8H5l-3 2 1-5a9 9 0 1 1 18-5Z" />
    </svg>
  );
}