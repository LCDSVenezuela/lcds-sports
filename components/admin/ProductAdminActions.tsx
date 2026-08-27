"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductAdminActions({
  productId,
  active,
  stock,
}: {
  productId: number;
  active: boolean;
  stock: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo actualizar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    const confirmed = window.confirm("¿Eliminar este producto definitivamente? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setBusy("delete");
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo eliminar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void patch({ action: "active", active: !active }, "active")}
          className="min-h-9 rounded-lg border border-neutral-200 px-3 text-[10px] font-black disabled:opacity-50"
        >
          {active ? "DESACTIVAR" : "ACTIVAR"}
        </button>

        <button
          type="button"
          disabled={Boolean(busy) || stock === 0}
          onClick={() => void patch({ action: "stock", stock: 0 }, "stock")}
          className="min-h-9 rounded-lg border border-neutral-200 px-3 text-[10px] font-black disabled:opacity-50"
        >
          MARCAR AGOTADO
        </button>

        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void patch({ action: "move", direction: "up" }, "up")}
          className="min-h-9 rounded-lg border border-neutral-200 px-3 text-[10px] font-black disabled:opacity-50"
          aria-label="Subir producto"
        >
          ↑
        </button>

        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void patch({ action: "move", direction: "down" }, "down")}
          className="min-h-9 rounded-lg border border-neutral-200 px-3 text-[10px] font-black disabled:opacity-50"
          aria-label="Bajar producto"
        >
          ↓
        </button>

        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void remove()}
          className="min-h-9 rounded-lg border border-red-200 px-3 text-[10px] font-black text-red-600 disabled:opacity-50"
        >
          ELIMINAR
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
