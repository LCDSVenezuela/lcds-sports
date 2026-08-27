"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function parseRate(value: string) {
  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  return Number(normalized);
}

export default function RateForm({ initialRate }: { initialRate: number }) {
  const router = useRouter();
  const [rate, setRate] = useState(String(initialRate));
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const parsedRate = parseRate(rate);
      if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
        throw new Error("Ingresa una tasa válida mayor que 0.");
      }

      const response = await fetch("/api/admin/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: parsedRate }),
      });

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error(data?.error || "No se pudo actualizar la tasa");

      const savedRate = Number(data.rate);
      if (Number.isFinite(savedRate)) setRate(String(savedRate));
      setStatus("Tasa BCV guardada correctamente.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Tasa BCV vigente</label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-neutral-500">Bs.</span>
          <input
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            inputMode="decimal"
            className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base font-bold outline-none focus:border-emerald-500"
            placeholder="Ej. 250,00"
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="min-h-12 w-full rounded-xl bg-neutral-950 px-5 text-sm font-black text-white transition hover:bg-emerald-500 hover:text-neutral-950 disabled:opacity-50">
        {saving ? "GUARDANDO..." : "GUARDAR TASA"}
      </button>

      {status && <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">{status}</p>}
    </form>
  );
}
