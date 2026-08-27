"use client";

import { useMemo, useState } from "react";
import type { PaymentMethod, WholesaleTier } from "@/lib/catalog";
import { calculateBcvBs, formatBs, formatUsd } from "@/lib/pricing";

export default function WhatsAppOrderButton({
  productName,
  sku,
  priceUsd,
  bcvReferenceUsd,
  rateBcv,
  phone,
  paymentMethods,
  stock,
  wholesaleEnabled,
  wholesaleTiers,
  freeShipping,
}: {
  productName: string;
  sku: string | null;
  priceUsd: number;
  bcvReferenceUsd: number;
  rateBcv: number;
  phone: string;
  paymentMethods: PaymentMethod[];
  stock: number;
  wholesaleEnabled: boolean;
  wholesaleTiers: WholesaleTier[];
  freeShipping: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState(paymentMethods[0]?.name || "Por definir");
  const [carrier, setCarrier] = useState("Zoom");

  const activeTier = useMemo(() => {
    if (!wholesaleEnabled || wholesaleTiers.length === 0) return null;

    return [...wholesaleTiers]
      .sort((a, b) => b.minQuantity - a.minQuantity)
      .find((tier) => quantity >= tier.minQuantity) ?? null;
  }, [quantity, wholesaleEnabled, wholesaleTiers]);

  const unitUsd = activeTier?.priceUsd ?? priceUsd;
  const unitBcvReferenceUsd = activeTier?.bcvReferenceUsd ?? bcvReferenceUsd;
  const unitBs = calculateBcvBs(unitBcvReferenceUsd, rateBcv);
  const totalUsd = unitUsd * quantity;
  const totalBs = unitBs * quantity;
  const maxQuantity = Math.max(1, stock || 1);

  const link = useMemo(() => {
    const message = [
      "Hola, LCDS Sports 🥎",
      "",
      "Quiero realizar este pedido:",
      `• Producto: ${productName}`,
      sku ? `• SKU: ${sku}` : null,
      `• Cantidad: ${quantity}`,
      activeTier ? `• Precio aplicado: ${activeTier.label || `Mayorista desde ${activeTier.minQuantity} unidades`}` : "• Precio aplicado: Detal",
      `• Precio unitario USD: ${formatUsd(unitUsd)}`,
      `• Total USD: ${formatUsd(totalUsd)}`,
      `• Total Bs.: ${formatBs(totalBs)}`,
      `• Método de pago preferido: ${method}`,
      freeShipping ? `• Envío: GRATIS por ${carrier}` : "• Envío: Consultar condiciones",
      "",
      "Quedo atento para confirmar disponibilidad, pago y despacho.",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [activeTier, carrier, freeShipping, method, phone, productName, quantity, sku, totalBs, totalUsd, unitUsd]);

  return (
    <div id="comprar" className="scroll-mt-32">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">Cantidad</p>
          <div className="mt-2 inline-flex items-center overflow-hidden rounded-full border border-neutral-300 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-11 w-11 items-center justify-center text-lg font-black transition hover:bg-neutral-100"
              aria-label="Restar cantidad"
            >
              −
            </button>
            <div className="flex h-11 min-w-12 items-center justify-center border-x border-neutral-200 text-sm font-black">{quantity}</div>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              className="flex h-11 w-11 items-center justify-center text-lg font-black transition hover:bg-neutral-100"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">Total</p>
          <p className="mt-1 text-2xl font-black tracking-[-0.035em] text-neutral-950">{formatUsd(totalUsd)}</p>
          <p className="mt-0.5 text-xs font-bold text-neutral-500">{formatBs(totalBs)}</p>
        </div>
      </div>

      {activeTier && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em]">Precio mayorista activo</p>
            <p className="mt-1 text-xs font-bold">{activeTier.label || `Desde ${activeTier.minQuantity} unidades`}</p>
          </div>
          <p className="text-sm font-black">{formatUsd(unitUsd)} c/u</p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {paymentMethods.length > 0 && (
          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">Método de pago</span>
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-bold outline-none transition focus:border-neutral-950"
            >
              {paymentMethods.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
        )}

        {freeShipping && (
          <div>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">Envío gratis</span>
            <div className="grid grid-cols-2 gap-2">
              {["Zoom", "Tealca"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCarrier(item)}
                  className={`min-h-12 rounded-xl border px-3 text-sm font-black transition ${carrier === item ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <a
        href={stock > 0 ? link : undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={stock <= 0}
        className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition duration-300 ${
          stock > 0
            ? "bg-emerald-400 text-neutral-950 hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            : "pointer-events-none bg-neutral-200 text-neutral-500"
        }`}
      >
        {stock > 0 ? (
          <>
            PEDIR POR WHATSAPP
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </>
        ) : "PRODUCTO AGOTADO"}
      </a>

      {stock > 0 && (
        <p className="mt-3 text-center text-[10px] font-semibold text-neutral-400">Disponibles: {stock} · Confirmación final por WhatsApp</p>
      )}
    </div>
  );
}
