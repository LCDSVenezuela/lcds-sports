"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import type { CatalogProduct } from "@/lib/catalog";
import { calculateBcvBs, formatBs } from "@/lib/pricing";

type TierDraft = {
  minQuantity: string;
  priceUsd: string;
  bcvReferenceUsd: string;
  label: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ product, rateBcv }: { product?: CatalogProduct; rateBcv: number }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [brand, setBrand] = useState(product?.brand || "Tamanaco");
  const [category, setCategory] = useState(product?.category || "Pelotas");
  const [subtitle, setSubtitle] = useState(product?.subtitle || "");
  const [description, setDescription] = useState(product?.description || "");
  const [badge, setBadge] = useState(product?.badge || "");
  const [labels, setLabels] = useState(product?.labels.join(", ") || "");
  const [priceUsd, setPriceUsd] = useState(String(product?.priceUsd ?? ""));
  const [bcvReferenceUsd, setBcvReferenceUsd] = useState(String(product?.bcvReferenceUsd ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [rating, setRating] = useState(String(product?.rating ?? 5));
  const [reviewCount, setReviewCount] = useState(String(product?.reviewCount ?? 0));
  const [freeShipping, setFreeShipping] = useState(product?.freeShipping ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [warrantyDays, setWarrantyDays] = useState(String(product?.warrantyDays ?? 1));
  const [wholesaleEnabled, setWholesaleEnabled] = useState(product?.wholesaleEnabled ?? true);
  const [wholesaleNote, setWholesaleNote] = useState(product?.wholesaleNote || "");
  const [images, setImages] = useState<string[]>(
    product?.images.length ? product.images.map((image) => image.imageUrl) : product?.image ? [product.image] : [""],
  );
  const [tiers, setTiers] = useState<TierDraft[]>(
    product?.wholesaleTiers.length
      ? product.wholesaleTiers.map((tier) => ({
          minQuantity: String(tier.minQuantity),
          priceUsd: String(tier.priceUsd),
          bcvReferenceUsd: String(tier.bcvReferenceUsd),
          label: tier.label || "",
        }))
      : [{ minQuantity: "6", priceUsd: "", bcvReferenceUsd: "", label: "Desde 6 unidades" }],
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const bsPreview = useMemo(() => {
    const ref = Number(bcvReferenceUsd);
    return Number.isFinite(ref) ? formatBs(calculateBcvBs(ref, rateBcv)) : "Bs. 0,00";
  }, [bcvReferenceUsd, rateBcv]);

  const mediaFolder = `products/${slug || slugify(name) || "nuevo-producto"}`;

  function updateImage(index: number, value: string) {
    setImages((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function updateTier(index: number, patch: Partial<TierDraft>) {
    setTiers((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const payload = {
        id: product?.id,
        name,
        slug: slug || slugify(name),
        sku,
        brand,
        category,
        subtitle,
        description,
        badge,
        labels: labels.split(",").map((item) => item.trim()).filter(Boolean),
        priceUsd: Number(priceUsd),
        bcvReferenceUsd: Number(bcvReferenceUsd),
        stock: Number(stock),
        featured,
        rating: Number(rating),
        reviewCount: Number(reviewCount),
        freeShipping,
        warrantyDays: Number(warrantyDays),
        wholesaleEnabled,
        wholesaleNote,
        images: images.filter(Boolean),
        wholesaleTiers: tiers.map((tier) => ({
          minQuantity: Number(tier.minQuantity),
          priceUsd: Number(tier.priceUsd),
          bcvReferenceUsd: Number(tier.bcvReferenceUsd),
          label: tier.label,
        })),
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error(data?.error || "No se pudo guardar el producto");

      setStatus(product ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      if (!product && data?.id) {
        router.push(`/admin/productos/${data.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Ficha comercial</p>
            <h2 className="mt-1 text-2xl font-black">Información del producto</h2>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase text-neutral-500">Mobile first</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Título" value={name} onChange={(value) => { setName(value); if (!product) setSlug(slugify(value)); }} />
          <Field label="Slug" value={slug} onChange={setSlug} />
          <Field label="SKU" value={sku} onChange={setSku} />
          <Field label="Marca" value={brand} onChange={setBrand} />
          <Field label="Categoría" value={category} onChange={setCategory} />
          <Field label="Subtítulo" value={subtitle} onChange={setSubtitle} />
          <Field label="Etiqueta principal" value={badge} onChange={setBadge} placeholder="Más vendida, Nuevo, Pack..." />
          <Field label="Etiquetas adicionales" value={labels} onChange={setLabels} placeholder="TOP, IMPORTADA, SOFTBALL" />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Descripción</label>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-base leading-6 outline-none focus:border-emerald-500" />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Precios e inventario</p>
        <h2 className="mt-1 text-2xl font-black">USD, bolívares y stock</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField label="Precio público USD" value={priceUsd} onChange={setPriceUsd} />
          <NumberField label="Referencia interna BCV USD" value={bcvReferenceUsd} onChange={setBcvReferenceUsd} />
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Resultado público en Bs.</p>
            <p className="mt-2 text-xl font-black">{bsPreview}</p>
            <p className="mt-1 text-xs text-neutral-400">Tasa actual: {rateBcv.toLocaleString("es-VE")}</p>
          </div>
          <NumberField label="Stock" value={stock} onChange={setStock} step="1" />
          <NumberField label="Rating (0 a 5)" value={rating} onChange={setRating} />
          <NumberField label="Cantidad de reseñas" value={reviewCount} onChange={setReviewCount} step="1" />
          <NumberField label="Garantía en días" value={warrantyDays} onChange={setWarrantyDays} step="1" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Toggle label="Producto destacado" checked={featured} onChange={setFeatured} />
          <Toggle label="Envío gratis Zoom/Tealca" checked={freeShipping} onChange={setFreeShipping} />
          <Toggle label="Venta al mayor" checked={wholesaleEnabled} onChange={setWholesaleEnabled} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Galería</p>
            <h2 className="mt-1 text-2xl font-black">Fotos del producto</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">La primera foto será la portada. Sube imágenes directamente desde tu teléfono o PC y ordénalas de izquierda a derecha.</p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black text-neutral-500">Hasta 8 fotos</span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div key={index} className="rounded-[22px] border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black">{index === 0 ? "Foto principal" : `Foto ${index + 1}`}</p>
                {images.length > 1 && (
                  <button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-[10px] font-black text-red-600">QUITAR</button>
                )}
              </div>
              <ImageUploader label={index === 0 ? "Portada" : "Galería"} value={image} onChange={(value) => updateImage(index, value)} folder={mediaFolder} />
            </div>
          ))}
        </div>

        {images.length < 8 && (
          <button type="button" onClick={() => setImages((current) => [...current, ""])} className="mt-5 min-h-11 rounded-xl border border-neutral-300 px-4 text-xs font-black transition hover:border-neutral-950">+ AGREGAR OTRA FOTO</button>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Mayoristas</p>
            <h2 className="mt-1 text-2xl font-black">Escalas por cantidad</h2>
          </div>
          <Toggle label="Activo" checked={wholesaleEnabled} onChange={setWholesaleEnabled} />
        </div>

        <div className="mt-4">
          <Field label="Nota comercial al mayor" value={wholesaleNote} onChange={setWholesaleNote} />
        </div>

        {wholesaleEnabled && (
          <div className="mt-5 space-y-3">
            {tiers.map((tier, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-neutral-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField label="Desde cantidad" value={tier.minQuantity} onChange={(value) => updateTier(index, { minQuantity: value })} step="1" />
                <NumberField label="Precio USD" value={tier.priceUsd} onChange={(value) => updateTier(index, { priceUsd: value })} />
                <NumberField label="Referencia BCV" value={tier.bcvReferenceUsd} onChange={(value) => updateTier(index, { bcvReferenceUsd: value })} />
                <div>
                  <Field label="Etiqueta" value={tier.label} onChange={(value) => updateTier(index, { label: value })} />
                  <button type="button" onClick={() => setTiers((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mt-2 text-xs font-black text-red-600">Eliminar escala</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setTiers((current) => [...current, { minQuantity: "", priceUsd: "", bcvReferenceUsd: "", label: "" }])} className="min-h-11 rounded-xl border border-neutral-300 px-4 text-xs font-black">+ AGREGAR ESCALA</button>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-neutral-950 p-5 text-white sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">Sesión protegida</p>
            <p className="mt-1 text-sm text-neutral-300">Los cambios se guardan con tu sesión de administrador.</p>
          </div>
          <button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-emerald-500 px-6 text-sm font-black text-neutral-950 disabled:opacity-50">
            {saving ? "GUARDANDO..." : product ? "ACTUALIZAR PRODUCTO" : "CREAR PRODUCTO"}
          </button>
        </div>
        {status && <p className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-neutral-200">{status}</p>}
      </section>
    </form>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none focus:border-emerald-500" />
    </div>
  );
}

function NumberField({ label, value, onChange, step = "0.01" }: { label: string; value: string; onChange: (value: string) => void; step?: string }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</label>
      <input type="number" step={step} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base font-bold outline-none focus:border-emerald-500" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-black">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-emerald-500" />
      {label}
    </label>
  );
}
