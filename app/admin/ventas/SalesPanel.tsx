"use client";

import { useMemo, useState } from "react";
import type { CatalogProduct, PaymentMethod } from "@/lib/catalog";
import type { SalesDocumentSummary } from "@/lib/sales";

type Line = { productId: number; quantity: number };

type Props = {
  products: CatalogProduct[];
  paymentMethods: PaymentMethod[];
  rateBcv: number;
  sellerEmail: string;
  today: string;
  initialDocuments: SalesDocumentSummary[];
};

function usd(value: number) {
  return `$${value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function bs(value: number) {
  return `Bs. ${value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SalesPanel({ products, paymentMethods, rateBcv, sellerEmail, today, initialDocuments }: Props) {
  const [documentType, setDocumentType] = useState<"quote" | "delivery">("quote");
  const [issuedDate, setIssuedDate] = useState(today);
  const [currency, setCurrency] = useState<"USD" | "BS">("USD");
  const [customerName, setCustomerName] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [sellerName, setSellerName] = useState(sellerEmail);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.name ?? "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? 0);
  const [documents, setDocuments] = useState(initialDocuments);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const totals = useMemo(() => lines.reduce(
    (result, line) => {
      const product = productById.get(line.productId);
      if (!product) return result;
      result.usd += product.priceUsd * line.quantity;
      result.bs += product.bcvReferenceUsd * rateBcv * line.quantity;
      return result;
    },
    { usd: 0, bs: 0 },
  ), [lines, productById, rateBcv]);

  function addProduct() {
    if (!selectedProductId) return;
    setLines((current) => {
      const existing = current.find((line) => line.productId === selectedProductId);
      return existing
        ? current.map((line) => line.productId === selectedProductId ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { productId: selectedProductId, quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    setLines((current) => current.map((line) => line.productId === productId ? { ...line, quantity: Math.max(1, quantity || 1) } : line));
  }

  async function createDocument() {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          issuedDate,
          customerName,
          customerTaxId,
          customerPhone,
          customerAddress,
          sellerName,
          paymentMethod,
          currency,
          exchangeRate: rateBcv,
          notes,
          items: lines,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo crear el documento");

      setStatus(`${data.document.documentNumber} creado correctamente.`);
      setDocuments((current) => [{
        id: data.document.id,
        documentNumber: data.document.documentNumber,
        documentType,
        issuedDate,
        validUntil: data.document.validUntil,
        customerName,
        currency,
        totalUsd: totals.usd,
        totalBs: totals.bs,
        createdAt: new Date().toISOString(),
      }, ...current].slice(0, 30));
      window.open(data.pdfUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el documento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Nueva venta</p>
            <h2 className="mt-1 text-2xl font-black">Crear documento</h2>
          </div>
          <div className="inline-flex rounded-xl bg-neutral-100 p-1">
            <button type="button" onClick={() => setDocumentType("quote")} className={`rounded-lg px-4 py-2 text-xs font-black ${documentType === "quote" ? "bg-white shadow-sm" : "text-neutral-500"}`}>COTIZACIÓN</button>
            <button type="button" onClick={() => setDocumentType("delivery")} className={`rounded-lg px-4 py-2 text-xs font-black ${documentType === "delivery" ? "bg-white shadow-sm" : "text-neutral-500"}`}>NOTA DE ENTREGA</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Cliente *" value={customerName} onChange={setCustomerName} placeholder="Nombre o razón social" />
          <Field label="Cédula / RIF" value={customerTaxId} onChange={setCustomerTaxId} placeholder="V-00.000.000" />
          <Field label="Teléfono" value={customerPhone} onChange={setCustomerPhone} placeholder="0424-000.00.00" />
          <Field label="Dirección" value={customerAddress} onChange={setCustomerAddress} placeholder="Dirección del cliente" />
          <Field label="Vendedor *" value={sellerName} onChange={setSellerName} />
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Fecha de emisión</label>
            <input type="date" value={issuedDate} onChange={(event) => setIssuedDate(event.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 font-semibold outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Método de pago *</label>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 font-semibold outline-none focus:border-emerald-500">
              <option value="">Seleccionar</option>
              {paymentMethods.map((method) => <option key={method.id} value={method.name}>{method.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Moneda del documento</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCurrency("USD")} className={`min-h-12 rounded-xl border text-sm font-black ${currency === "USD" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200"}`}>USD</button>
              <button type="button" onClick={() => setCurrency("BS")} className={`min-h-12 rounded-xl border text-sm font-black ${currency === "BS" ? "border-emerald-500 bg-emerald-500 text-neutral-950" : "border-neutral-200"}`}>BOLÍVARES</button>
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-neutral-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(Number(event.target.value))} className="min-h-12 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold outline-none focus:border-emerald-500">
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {usd(product.priceUsd)}</option>)}
            </select>
            <button type="button" onClick={addProduct} className="min-h-12 rounded-xl bg-emerald-500 px-5 text-xs font-black text-neutral-950">+ AGREGAR PRODUCTO</button>
          </div>

          <div className="mt-4 space-y-3">
            {lines.length === 0 && <p className="rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm font-semibold text-neutral-400">Aún no has agregado productos.</p>}
            {lines.map((line) => {
              const product = productById.get(line.productId);
              if (!product) return null;
              const equivalent = product.bcvReferenceUsd * rateBcv;
              return (
                <div key={line.productId} className="grid gap-3 rounded-2xl bg-neutral-50 p-4 sm:grid-cols-[1fr_100px_145px_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-black">{product.name}</p>
                    <p className="mt-1 text-xs font-semibold text-neutral-500">{usd(product.priceUsd)} · {bs(equivalent)}</p>
                  </div>
                  <input aria-label={`Cantidad de ${product.name}`} type="number" min="1" value={line.quantity} onChange={(event) => updateQuantity(line.productId, Number(event.target.value))} className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3 text-center font-black outline-none" />
                  <p className="text-sm font-black sm:text-right">{currency === "USD" ? usd(product.priceUsd * line.quantity) : bs(equivalent * line.quantity)}</p>
                  <button type="button" onClick={() => setLines((current) => current.filter((item) => item.productId !== line.productId))} className="min-h-10 rounded-xl border border-red-200 px-3 text-xs font-black text-red-600">QUITAR</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Observaciones</label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Condiciones especiales, entrega, reserva u otra información." className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-neutral-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">Tasa aplicada</p>
            <p className="mt-1 text-sm font-black">Bs. {rateBcv.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
            <p className="mt-1 text-[10px] text-neutral-400">Válida hasta terminar el próximo día hábil.</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400">Total seleccionado</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">{currency === "USD" ? usd(totals.usd) : bs(totals.bs)}</p>
            <p className="mt-1 text-xs text-neutral-400">Equivalencia: {currency === "USD" ? bs(totals.bs) : usd(totals.usd)}</p>
          </div>
        </div>

        <button type="button" onClick={() => void createDocument()} disabled={saving || lines.length === 0} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-500 px-5 text-sm font-black text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? "GENERANDO..." : `GENERAR ${documentType === "quote" ? "COTIZACIÓN" : "NOTA DE ENTREGA"} EN PDF`}
        </button>
        {status && <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">{status}</p>}
      </section>

      <aside className="rounded-3xl bg-white p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Historial</p>
        <h2 className="mt-1 text-2xl font-black">Documentos recientes</h2>
        <div className="mt-5 space-y-3">
          {documents.length === 0 && <p className="rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">Todavía no hay documentos.</p>}
          {documents.map((document) => (
            <a key={document.id} href={`/api/admin/sales/${document.id}/pdf`} target="_blank" rel="noreferrer" className="block rounded-2xl border border-neutral-200 p-4 transition hover:border-emerald-500">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black">{document.documentNumber}</span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[8px] font-black uppercase">{document.documentType === "quote" ? "Cotización" : "Nota"}</span>
              </div>
              <p className="mt-2 truncate text-sm font-black">{document.customerName}</p>
              <p className="mt-1 text-xs text-neutral-500">{document.currency === "USD" ? usd(document.totalUsd) : bs(document.totalBs)} · vence {document.validUntil}</p>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 font-semibold outline-none focus:border-emerald-500" />
    </div>
  );
}
