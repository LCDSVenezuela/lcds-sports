"use client";

import { useMemo, useState } from "react";
import type { PaymentMethod } from "@/lib/catalog";
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
}: {
  productName: string;
  sku: string | null;
  priceUsd: number;
  bcvReferenceUsd: number;
  rateBcv: number;
  phone: string;
  paymentMethods: PaymentMethod[];
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState(paymentMethods[0]?.name || "Por definir");
  const bsUnit = calculateBcvBs(bcvReferenceUsd, rateBcv);

  const link = useMemo(() => {
    const totalUsd = priceUsd * quantity;
    const totalBs = bsUnit * quantity;
    const message = [
      "Hola, LCDS Sports 🥎",
      "",
      "Quiero realizar este pedido:",
      `• ${productName}`,
      sku ? `• SKU: ${sku}` : null,
      `• Cantidad: ${quantity}`,
      `• Precio divisas: ${formatUsd(totalUsd)}`,
      `• Precio en Bs.: ${formatBs(totalBs)}`,
      `• Método de pago preferido: ${method}`,
      "",
      "Quedo atento para confirmar disponibilidad, pago y envío.",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [phone, productName, sku, quantity, priceUsd, bsUnit, method]);

  return (
    <div className="space-y-4">
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
            onClick={() => setQuantity((value) => Math.min(Math.max(1, stock || 99), value + 1))}
            className="flex h-12 w-12 items-center justify-center text-lg font-black transition hover:bg-neutral-50"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      {paymentMethods.length > 0 && (
        <div>
          <label htmlFor="payment-method" className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
            Método de pago preferido
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
        {stock > 0 ? "PEDIR POR WHATSAPP" : "PRODUCTO AGOTADO"}
      </a>

      <div className="rounded-xl bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-500">
        El pedido se envía con producto, cantidad, total en USD, total en Bs. y método de pago seleccionado.
      </div>
    </div>
  );
}
