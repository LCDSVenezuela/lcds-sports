"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

function cleanName(name: string) {
  const dot = name.lastIndexOf(".");
  const extension = dot >= 0 ? name.slice(dot).toLowerCase() : "";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "imagen";
  return `${base}${extension}`;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  folder,
  aspect = "square",
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  folder: string;
  aspect?: "square" | "banner";
  optional?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen no puede superar 8 MB.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const normalizedFolder = folder
        .toLowerCase()
        .replace(/[^a-z0-9/_-]+/g, "-")
        .replace(/^\/+|\/+$/g, "") || "media";

      const blob = await upload(`${normalizedFolder}/${Date.now()}-${cleanName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: JSON.stringify({ folder: normalizedFolder }),
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      onChange(blob.url);
      setProgress(100);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen";
      setError(
        message.toLowerCase().includes("token") || message.toLowerCase().includes("blob")
          ? "La subida de imágenes aún no tiene conectado Vercel Blob."
          : message,
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</label>
        {optional && <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-300">Opcional</span>}
      </div>

      <div className={`overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 ${aspect === "banner" ? "aspect-[16/7]" : "aspect-square max-w-[220px]"}`}>
        {value ? (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Vista previa" className={`h-full w-full ${aspect === "banner" ? "object-cover" : "object-contain p-3"}`} />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <button type="button" onClick={() => inputRef.current?.click()} className="min-h-9 rounded-lg bg-white px-3 text-[10px] font-black text-neutral-950">CAMBIAR</button>
              <button type="button" onClick={() => onChange("")} className="min-h-9 rounded-lg bg-black/60 px-3 text-[10px] font-black text-white">QUITAR</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 text-center transition hover:bg-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-2xl text-emerald-400">＋</span>
            <span className="text-xs font-black text-neutral-700">SUBIR IMAGEN</span>
            <span className="text-[10px] leading-4 text-neutral-400">JPG, PNG, WEBP o AVIF · Máx. 8 MB</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => void onFile(event.target.files?.[0])} />

      {uploading && (
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.max(4, progress)}%` }} />
          </div>
          <p className="mt-1 text-[10px] font-bold text-neutral-400">Subiendo {progress}%</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
