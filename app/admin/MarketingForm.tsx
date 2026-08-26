"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { StoreBanner, StoreSettings } from "@/lib/catalog";

type EditableBanner = {
  id?: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  ctaText: string;
  ctaHref: string;
  active: boolean;
  sortOrder: number;
};

function normalizeBanner(banner: StoreBanner | undefined, index: number): EditableBanner {
  return {
    id: banner?.id,
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    imageUrl: banner?.imageUrl || "",
    mobileImageUrl: banner?.mobileImageUrl || "",
    ctaText: banner?.ctaText || "",
    ctaHref: banner?.ctaHref || "",
    active: banner?.active ?? true,
    sortOrder: index + 1,
  };
}

export default function MarketingForm({ settings: initialSettings, banners: initialBanners }: { settings: StoreSettings; banners: StoreBanner[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [banners, setBanners] = useState<EditableBanner[]>([
    normalizeBanner(initialBanners[0], 0),
    normalizeBanner(initialBanners[1], 1),
    normalizeBanner(initialBanners[2], 2),
  ]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function updateBanner(index: number, patch: Partial<EditableBanner>) {
    setBanners((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, banners }),
      });

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error(data?.error || "No se pudo guardar la configuración");
      setStatus("Marketing y banners actualizados correctamente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Barra superior</p>
        <h2 className="mt-1 text-2xl font-black">Anuncio y datos de tienda</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Controla el mensaje superior, WhatsApp, ubicación, envíos y el texto comercial de mayoristas.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Texto del anuncio" value={settings.announcementText} onChange={(value) => setSettings({ ...settings, announcementText: value })} />
          <Field label="Enlace del anuncio (opcional)" value={settings.announcementLink || ""} onChange={(value) => setSettings({ ...settings, announcementLink: value || null })} />
          <Field label="WhatsApp internacional" value={settings.whatsappPhone} onChange={(value) => setSettings({ ...settings, whatsappPhone: value })} />
          <Field label="Ubicación" value={settings.locationText} onChange={(value) => setSettings({ ...settings, locationText: value })} />
          <Field label="Texto de envíos" value={settings.shippingText} onChange={(value) => setSettings({ ...settings, shippingText: value })} />
          <div className="flex items-end">
            <label className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-4 text-sm font-bold">
              <input type="checkbox" checked={settings.announcementEnabled} onChange={(event) => setSettings({ ...settings, announcementEnabled: event.target.checked })} className="h-4 w-4 accent-emerald-500" />
              Mostrar barra de anuncio
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Título de sección al mayor" value={settings.wholesaleTitle} onChange={(value) => setSettings({ ...settings, wholesaleTitle: value })} />
          <Field label="Texto de sección al mayor" value={settings.wholesaleText} onChange={(value) => setSettings({ ...settings, wholesaleText: value })} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Portada</p>
            <h2 className="mt-1 text-2xl font-black">Banners principales</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Hasta 3 banners. Sube la imagen directamente desde el teléfono o la PC. Puedes usar una imagen móvil distinta para controlar mejor el recorte.</p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Máximo 3</span>
        </div>

        <div className="mt-6 space-y-5">
          {banners.map((banner, index) => (
            <div key={index} className="rounded-[24px] border border-neutral-200 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black">Banner {index + 1}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">La imagen general se usa en desktop y tablet.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                  <input type="checkbox" checked={banner.active} onChange={(event) => updateBanner(index, { active: event.target.checked })} className="h-4 w-4 accent-emerald-500" />
                  Activo
                </label>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <ImageUploader label="Imagen general" value={banner.imageUrl} onChange={(value) => updateBanner(index, { imageUrl: value })} folder={`banners/banner-${index + 1}`} aspect="banner" />
                <ImageUploader label="Imagen móvil" value={banner.mobileImageUrl} onChange={(value) => updateBanner(index, { mobileImageUrl: value })} folder={`banners/banner-${index + 1}-mobile`} aspect="banner" optional />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Título" value={banner.title} onChange={(value) => updateBanner(index, { title: value })} />
                <Field label="Subtítulo" value={banner.subtitle} onChange={(value) => updateBanner(index, { subtitle: value })} />
                <Field label="Texto del botón" value={banner.ctaText} onChange={(value) => updateBanner(index, { ctaText: value })} placeholder="Ver productos" />
                <Field label="Destino del botón" value={banner.ctaHref} onChange={(value) => updateBanner(index, { ctaHref: value })} placeholder="#productos" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-neutral-950 p-5 text-white sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">Sesión protegida</p>
            <p className="mt-1 text-sm text-neutral-300">Ya no necesitas escribir una clave administrativa en cada cambio.</p>
          </div>
          <button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-emerald-500 px-6 text-sm font-black text-neutral-950 disabled:opacity-50">
            {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
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
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-base outline-none transition focus:border-emerald-500" />
    </div>
  );
}
