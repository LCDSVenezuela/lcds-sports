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
  const socialLinks = [
    { name: "Instagram", href: settings.instagramUrl, icon: "IG" },
    { name: "TikTok", href: settings.tiktokUrl, icon: "TT" },
    { name: "Facebook", href: settings.facebookUrl, icon: "FB" },
  ].filter((item): item is { name: string; href: string; icon: string } => Boolean(item.href));

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_0.95fr_1.15fr] lg:gap-14">
          <div>
            <Link href="/" className="relative block h-12 w-44" aria-label="LCDS Sports">
              <Image
                src="/brand/lcds-logo.png"
                alt="LCDS Sports"
                fill
                sizes="176px"
                className="object-contain object-left brightness-0 invert"
              />
            </Link>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {settings.locationText}
            </div>
          </div>

          <div>
            <p className="text-sm font-black">Ayuda</p>
            <nav className="mt-4 space-y-2.5 text-sm text-neutral-300">
              <Link href="/politicas" className="block transition hover:text-emerald-400">Políticas de compra</Link>
              <Link href="/reembolsos" className="block transition hover:text-emerald-400">Cambios y reembolsos</Link>
              <Link href="/#envios" className="block transition hover:text-emerald-400">Envíos</Link>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="block transition hover:text-emerald-400">Soporte por WhatsApp</a>
            </nav>
          </div>

          <div>
            <p className="text-sm font-black">LCDS Sports</p>
            <nav className="mt-4 space-y-2.5 text-sm text-neutral-300">
              <Link href="/#productos" className="block transition hover:text-emerald-400">Productos</Link>
              <Link href="/#categorias" className="block transition hover:text-emerald-400">Categorías</Link>
              <Link href="/mayoristas" className="block transition hover:text-emerald-400">Ventas al mayor</Link>
              <Link href="/politicas#pagos" className="block transition hover:text-emerald-400">Métodos de pago</Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-black">¿Necesitas ayuda?</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-300">Escríbenos por WhatsApp y te ayudamos con producto, pago y despacho.</p>
            {settings.businessHours && (
              <div className="mt-4 border-l-2 border-emerald-400 pl-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-500">Horario de atención</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-white">{settings.businessHours}</p>
              </div>
            )}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-xs font-black text-neutral-950 transition hover:bg-white"
            >
              ESCRIBIR POR WHATSAPP
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Métodos de pago</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-2.5 text-sm font-semibold text-neutral-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-emerald-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                      <rect x="3" y="6" width="18" height="12" rx="2" />
                      <path d="M3 10h18M7 15h3" />
                    </svg>
                  </span>
                  <span>{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Síguenos</p>
            <div className="mt-4 flex gap-2 lg:justify-end">
              <SocialLink href={whatsappHref} label="WhatsApp" text="WA" />
              {socialLinks.map((social) => (
                <SocialLink key={social.name} href={social.href} label={social.name} text={social.icon} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LCDS Sports. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/politicas" className="transition hover:text-white">Políticas</Link>
            <Link href="/reembolsos" className="transition hover:text-white">Reembolsos</Link>
            <span>{settings.locationText}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[10px] font-black tracking-tight text-white transition hover:border-emerald-400 hover:bg-emerald-400 hover:text-black"
    >
      {text}
    </a>
  );
}
