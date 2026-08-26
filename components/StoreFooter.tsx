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
    <footer className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="relative h-14 w-40 rounded-xl bg-white p-2">
              <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="160px" className="object-contain p-2" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-400">
              La Casa del Softball. Equipamiento, pelotas y artículos deportivos para jugadores, equipos, academias y comercios.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300">Portuguesa</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300">Venezuela</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Envíos nacionales</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Comprar</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-neutral-300">
              <Link href="/#productos" className="block transition hover:text-emerald-400">Pelotas de softball</Link>
              <Link href="/#productos" className="block transition hover:text-emerald-400">Guantes y accesorios</Link>
              <Link href="/#mayor" className="block transition hover:text-emerald-400">Ventas al mayor</Link>
              <Link href="/#confianza" className="block transition hover:text-emerald-400">Pagos y envíos</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Ayuda</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-neutral-300">
              <span className="block">{settings.shippingText}</span>
              <span className="block">{settings.locationText}</span>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="block transition hover:text-emerald-400">Atención por WhatsApp</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Métodos de pago</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span key={method.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-neutral-300">
                  {method.name}
                </span>
              ))}
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 text-xs font-black text-neutral-950 transition hover:bg-emerald-400"
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
