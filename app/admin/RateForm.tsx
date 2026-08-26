"use client";

import { useState } from "react";

export default function RateForm({ initialRate }: { initialRate: number }) {
  const [rate, setRate] = useState(String(initialRate));
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ rate: Number(rate) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo actualizar la tasa");
      }

      setStatus("Tasa BCV actualizada correctamente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
          Tasa BCV vigente
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-neutral-500">Bs.</span>
          <input
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            inputMode="decimal"
            className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base font-bold outline-none focus:border-green-600"
            placeholder="Ej. 250.00"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
          Clave administrativa
        </label>
        <input
          type="password"
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none focus:border-green-600"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="min-h-12 w-full rounded-xl bg-neutral-950 px-5 text-sm font-black text-white disabled:opacity-50"
      >
        {saving ? "ACTUALIZANDO..." : "ACTUALIZAR TASA"}
      </button>

      {status && (
        <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">
          {status}
        </p>
      )}
    </form>
  );
}
