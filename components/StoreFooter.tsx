import Image from "next/image";
import Link from "next/link";
import type { PaymentMethod, StoreSettings } from "@/lib/catalog";

export default function StoreFooter({
  settings,
  paymentMethods,
}: {
  settings: StoreSettings;
  paymentMethods: PaymentMethod[];
}) {
  const whatsappHref = `https://wa.me/${settings.whatsappPhone}`;

  return (
    <footer className="relative overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full border-[48px] border-emerald-500/[0.05]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-emerald-500/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.95fr_1.15fr]">
          <div>
            <div className="relative h-14 w-40 rounded-xl bg-white p-2 shadow-lg shadow-black/20">
              <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="160px" className="object-contain p-2" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-400">
              La Casa del Softball. Una tienda deportiva pensada para jugadores, equipos, academias, comercios y revendedores.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300">Portuguesa</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300">Venezuela</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Zoom + Tealca gratis</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Comprar</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-neutral-300">
              <Link href="/#productos" className="block transition hover:text-emerald-400">Catálogo deportivo</Link>
              <Link href="/#categorias" className="block transition hover:text-emerald-400">Categorías</Link>
              <Link href="/mayoristas" className="block transition hover:text-emerald-400">Ventas al mayor</Link>
              <Link href="/#envios" className="block transition hover:text-emerald-400">Envío gratis</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Atención</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-neutral-300">
              <span className="block">{settings.locationText}</span>
              <span className="block">{settings.shippingText}</span>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="block transition hover:text-emerald-400">Atención por WhatsApp</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Compra flexible</p>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              En cada producto verás el precio en USD, su monto calculado en Bs. y los métodos de pago disponibles.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {paymentMethods.slice(0, 4).map((method) => (
                <span key={method.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-neutral-300">
                  {method.name}
                </span>
              ))}
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 text-xs font-black text-neutral-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Hablar con ventas
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LCDS Sports. Todos los derechos reservados.</p>
          <p>La Casa del Softball · Portuguesa, Venezuela</p>
        </div>
      </div>
    </footer>
  );
}
