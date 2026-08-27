"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaxonomyItem, TaxonomyKind } from "@/lib/admin-taxonomy";

export default function TaxonomyManager({
  brands,
  categories,
}: {
  brands: TaxonomyItem[];
  categories: TaxonomyItem[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TaxonomySection kind="brand" title="Marcas" singular="marca" items={brands} />
      <TaxonomySection kind="category" title="Categorías" singular="categoría" items={categories} />
    </div>
  );
}

function TaxonomySection({
  kind,
  title,
  singular,
  items,
}: {
  kind: TaxonomyKind;
  title: string;
  singular: string;
  items: TaxonomyItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function run(payload: Record<string, unknown>) {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...payload }),
      });
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return false;
      }
      if (!response.ok) throw new Error(data?.error || "No se pudo guardar");
      router.refresh();
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!name.trim()) {
      setStatus(`Escribe el nombre de la ${singular}.`);
      return;
    }
    const ok = await run({ action: "save", id: editingId || undefined, name, active: true });
    if (ok) {
      setName("");
      setEditingId(null);
      setStatus(editingId ? `${capitalize(singular)} actualizada.` : `${capitalize(singular)} creada.`);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 sm:p-7">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Organización del catálogo</p>
        <h2 className="mt-1 text-2xl font-black">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Crea nombres consistentes para usarlos al registrar productos.</p>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={`Nueva ${singular}`}
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 text-base font-semibold outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="min-h-12 rounded-xl bg-neutral-950 px-4 text-xs font-black text-white disabled:opacity-50"
        >
          {editingId ? "GUARDAR" : "AGREGAR"}
        </button>
      </div>

      {editingId && (
        <button
          type="button"
          onClick={() => { setEditingId(null); setName(""); setStatus(""); }}
          className="mt-2 text-xs font-black text-neutral-500"
        >
          Cancelar edición
        </button>
      )}

      <div className="mt-6 space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${item.active ? "border-neutral-200" : "border-neutral-100 bg-neutral-50 opacity-65"}`}>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{item.name}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">{item.active ? "Activa" : "Inactiva"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setEditingId(item.id); setName(item.name); setStatus(""); }}
                className="min-h-9 rounded-lg border border-neutral-200 px-3 text-[10px] font-black"
              >
                EDITAR
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void run({ action: "toggle", id: item.id, active: !item.active })}
                className="min-h-9 rounded-lg border border-neutral-200 px-3 text-[10px] font-black"
              >
                {item.active ? "DESACTIVAR" : "ACTIVAR"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  if (window.confirm(`¿Eliminar ${singular} “${item.name}”?`)) void run({ action: "delete", id: item.id });
                }}
                className="min-h-9 rounded-lg px-3 text-[10px] font-black text-red-600"
              >
                ELIMINAR
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-2xl bg-neutral-50 p-5 text-sm font-semibold text-neutral-500">Aún no hay registros.</div>
        )}
      </div>

      {status && <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">{status}</p>}
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
