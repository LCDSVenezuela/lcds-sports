"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId, productName }: { productId: number; productName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente “${productName}”?\n\nSe quitará del catálogo y esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "No se pudo eliminar el producto");
      router.push("/admin/productos");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el producto");
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void remove()}
        disabled={deleting}
        className="min-h-12 rounded-xl bg-red-600 px-5 text-xs font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "ELIMINANDO..." : "ELIMINAR PRODUCTO"}
      </button>
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
