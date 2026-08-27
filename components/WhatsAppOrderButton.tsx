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

  const link = useMemo(() => {
    const message = [
      "Hola, LCDS Sports 🥎",
      "",
      "Quiero realizar este pedido:",
      `• Producto: ${productName}`,
      sku ? `• SKU: ${sku}` : null,
      `• Cantidad: ${quantity}`,
      activeTier ? `• Precio aplicado: ${activeTier.label || `Mayorista desde ${activeTier.minQuantity} unidades`}` : "• Precio aplicado: Detal" ,
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

  const maxQuantity = Math.max(1, stock || 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Cantidad</label>
          <div className="inline-flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-12 w-12 items-center justify-center text-lg font-black transition hover:bg-neutral-50"
              aria-label="Restar cantidad"
            >
              −
            </button>
            <div className="flex h-12 min-w-14 items-center justify-center border-x border-neutral-200 text-sm font-black">{quantity}</div>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              className="flex h-12 w-12 items-center justify-center text-lg font-black transition hover:bg-neutral-50"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          {stock > 0 && <p className="mt-2 text-[10px] font-semibold text-neutral-400">Máximo disponible: {stock}</p>}
        </div>

        {paymentMethods.length > 0 && (
          <div>
            <label htmlFor="payment-method" className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
              Método de pago
            </label>
            <select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-base font-bold outline-none focus:border-emerald-500"
            >
              {paymentMethods.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {freeShipping && (
        <div>
          <label htmlFor="shipping-carrier" className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
            Envío gratis
          </label>
          <select
            id="shipping-carrier"
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-base font-bold outline-none focus:border-emerald-500"
          >
            <option value="Zoom">Zoom</option>
            <option value="Tealca">Tealca</option>
          </select>
        </div>
      )}

      <div className="rounded-2xl bg-neutral-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Precio aplicado</p>
            <p className="mt-1 text-sm font-black text-neutral-900">
              {activeTier ? activeTier.label || `Mayorista desde ${activeTier.minQuantity} unidades` : "Precio detal"}
            </p>
          </div>
          {activeTier && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
              MAYORISTA ACTIVO
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryItem label="Unitario" value={formatUsd(unitUsd)} />
          <SummaryItem label="Total USD" value={formatUsd(totalUsd)} />
          <SummaryItem label="Total Bs." value={formatBs(totalBs)} full />
        </div>
      </div>

      <a
        href={stock > 0 ? link : undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={stock <= 0}
        className={`flex min-h-14 w-full items-center justify-center rounded-xl px-5 text-sm font-black transition ${
          stock > 0
            ? "bg-emerald-500 text-neutral-950 hover:-translate-y-0.5 hover:bg-emerald-400"
            : "pointer-events-none bg-neutral-200 text-neutral-500"
        }`}
      >
        {stock > 0 ? "CONTINUAR PEDIDO POR WHATSAPP" : "PRODUCTO AGOTADO"}
      </a>

      <p className="text-[11px] leading-5 text-neutral-400">
        Al cambiar la cantidad, LCDS aplica automáticamente la escala mayorista disponible y recalcula USD y Bs. antes de enviar el pedido.
      </p>
    </div>
  );
}

function SummaryItem({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`rounded-xl bg-white px-3 py-3 ${full ? "col-span-2 sm:col-span-1" : ""}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-1 text-sm font-black text-neutral-900">{value}</p>
    </div>
  );
}
