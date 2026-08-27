"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/lib/catalog";

type Draft = { name: string; detail: string };

export default function PaymentMethodsForm({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const [methods, setMethods] = useState<Draft[]>(
    initialMethods.length
      ? initialMethods.map((method) => ({ name: method.name, detail: method.detail || "" }))
      : [{ name: "", detail: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  function update(index: number, patch: Partial<Draft>) {
    setMethods((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function save() {
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudieron guardar los métodos");
      setStatus("Métodos de pago actualizados.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Pago</p>
      <h2 className="mt-1 text-2xl font-black">Métodos de pago</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-500">Estos métodos aparecerán dentro de la ficha del producto y en el pedido que se envía por WhatsApp.</p>

      <div className="mt-6 space-y-3">
        {methods.map((method, index) => (
          <div key={index} className="grid gap-3 rounded-2xl border border-neutral-200 p-4 sm:grid-cols-[0.8fr_1.2fr_auto] sm:items-end">
            <Field label="Nombre" value={method.name} onChange={(value) => update(index, { name: value })} placeholder="Ej. Zelle" />
            <Field label="Detalle opcional" value={method.detail} onChange={(value) => update(index, { detail: value })} placeholder="Ej. Pago en divisas" />
            <button
              type="button"
              onClick={() => setMethods((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              className="min-h-12 rounded-xl border border-neutral-200 px-4 text-xs font-black text-red-600"
            >
              QUITAR
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {methods.length < 10 && (
          <button
            type="button"
            onClick={() => setMethods((current) => [...current, { name: "", detail: "" }])}
            className="min-h-11 rounded-xl border border-neutral-300 px-4 text-xs font-black"
          >
            + AGREGAR MÉTODO
          </button>
        )}
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="min-h-11 rounded-xl bg-neutral-950 px-5 text-xs font-black text-white disabled:opacity-50"
        >
          {saving ? "GUARDANDO..." : "GUARDAR MÉTODOS"}
        </button>
      </div>

      {status && <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">{status}</p>}
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none focus:border-emerald-500"
      />
    </div>
  );
}
