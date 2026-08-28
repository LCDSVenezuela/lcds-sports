import { db, ensureCatalogSchema } from "@/lib/db";

export type SalesDocumentType = "quote" | "delivery";
export type SalesCurrency = "USD" | "BS";

export type SalesDocumentSummary = {
  id: number;
  documentNumber: string;
  documentType: SalesDocumentType;
  issuedDate: string;
  validUntil: string;
  customerName: string;
  currency: SalesCurrency;
  totalUsd: number;
  totalBs: number;
  createdAt: string;
};

export type SalesDocumentDetail = SalesDocumentSummary & {
  customerTaxId: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  sellerName: string;
  paymentMethod: string;
  exchangeRate: number;
  notes: string | null;
  items: Array<{
    productName: string;
    sku: string | null;
    quantity: number;
    unitPriceUsd: number;
    unitPriceBs: number;
    lineTotalUsd: number;
    lineTotalBs: number;
  }>;
};

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function parseIssuedDate(value: unknown) {
  const date = clean(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("La fecha de emisión no es válida");
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("La fecha de emisión no es válida");
  return { date, parsed };
}

function nextBusinessDay(date: Date) {
  const result = new Date(date);
  do result.setUTCDate(result.getUTCDate() + 1);
  while (result.getUTCDay() === 0 || result.getUTCDay() === 6);
  return result.toISOString().slice(0, 10);
}

export async function createSalesDocument(input: {
  documentType: unknown;
  issuedDate: unknown;
  customerName: unknown;
  customerTaxId?: unknown;
  customerPhone?: unknown;
  customerAddress?: unknown;
  sellerName: unknown;
  paymentMethod: unknown;
  currency: unknown;
  exchangeRate: unknown;
  notes?: unknown;
  items: Array<{ productId: unknown; quantity: unknown }>;
  createdBy: number;
}) {
  await ensureCatalogSchema();

  const documentType = input.documentType === "delivery" ? "delivery" : "quote";
  const currency: SalesCurrency = input.currency === "BS" ? "BS" : "USD";
  const { date: issuedDate, parsed } = parseIssuedDate(input.issuedDate);
  const validUntil = nextBusinessDay(parsed);
  const customerName = clean(input.customerName, 160);
  const sellerName = clean(input.sellerName, 160);
  const paymentMethod = clean(input.paymentMethod, 120);
  const exchangeRate = Number(input.exchangeRate);

  if (!customerName) throw new Error("Ingresa el nombre del cliente");
  if (!sellerName) throw new Error("Ingresa el vendedor");
  if (!paymentMethod) throw new Error("Selecciona el método de pago");
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) throw new Error("La tasa no es válida");
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("Agrega al menos un producto");
  if (input.items.length > 100) throw new Error("El documento admite hasta 100 líneas");

  const normalized = input.items.map((item) => ({
    productId: Number(item.productId),
    quantity: Math.max(1, Math.floor(Number(item.quantity))),
  }));
  if (normalized.some((item) => !Number.isInteger(item.productId) || item.productId <= 0)) {
    throw new Error("Hay productos no válidos");
  }

  const sql = db();
  return sql.begin(async (tx) => {
    const ids = normalized.map((item) => item.productId);
    const rows = await tx`
      select id, name, sku, price_usd_cents, bcv_reference_usd_cents
      from products
      where active = true and id = any(${ids})
    `;
    const byId = new Map(rows.map((row) => [Number(row.id), row]));
    if (byId.size !== new Set(ids).size) throw new Error("Uno de los productos ya no está disponible");

    const rateE4 = Math.round(exchangeRate * 10000);
    const items = normalized.map((item) => {
      const product = byId.get(item.productId)!;
      const unitUsd = Number(product.price_usd_cents);
      const referenceUsd = Number(product.bcv_reference_usd_cents);
      const unitBs = Math.round((referenceUsd / 100) * exchangeRate * 100);
      return {
        ...item,
        name: String(product.name),
        sku: product.sku ? String(product.sku) : null,
        unitUsd,
        unitBs,
        totalUsd: unitUsd * item.quantity,
        totalBs: unitBs * item.quantity,
      };
    });

    const subtotalUsd = items.reduce((sum, item) => sum + item.totalUsd, 0);
    const subtotalBs = items.reduce((sum, item) => sum + item.totalBs, 0);
    const year = issuedDate.slice(0, 4);
    const prefix = documentType === "quote" ? "COT" : "NE";

    await tx`select pg_advisory_xact_lock(72633742)`;
    const countRows = await tx`
      select count(*)::int as count
      from sales_documents
      where document_type = ${documentType}
        and extract(year from issued_date) = ${Number(year)}
    `;
    const sequence = Number(countRows[0]?.count ?? 0) + 1;
    const documentNumber = `${prefix}-${year}-${String(sequence).padStart(6, "0")}`;

    const documentRows = await tx`
      insert into sales_documents (
        document_number, document_type, issued_date, valid_until,
        customer_name, customer_tax_id, customer_phone, customer_address,
        seller_name, payment_method, currency, exchange_rate_e4, notes,
        subtotal_usd_cents, subtotal_bs_cents, created_by
      )
      values (
        ${documentNumber}, ${documentType}, ${issuedDate}, ${validUntil},
        ${customerName}, ${clean(input.customerTaxId, 80) || null},
        ${clean(input.customerPhone, 80) || null}, ${clean(input.customerAddress, 300) || null},
        ${sellerName}, ${paymentMethod}, ${currency}, ${rateE4},
        ${clean(input.notes, 1500) || null}, ${subtotalUsd}, ${subtotalBs}, ${input.createdBy}
      )
      returning id
    `;
    const documentId = Number(documentRows[0].id);

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      await tx`
        insert into sales_document_items (
          document_id, product_id, product_name, sku, quantity,
          unit_price_usd_cents, unit_price_bs_cents,
          line_total_usd_cents, line_total_bs_cents, sort_order
        )
        values (
          ${documentId}, ${item.productId}, ${item.name}, ${item.sku}, ${item.quantity},
          ${item.unitUsd}, ${item.unitBs}, ${item.totalUsd}, ${item.totalBs}, ${index}
        )
      `;
    }

    return { id: documentId, documentNumber, validUntil };
  });
}

export async function getRecentSalesDocuments(limit = 30): Promise<SalesDocumentSummary[]> {
  await ensureCatalogSchema();
  const rows = await db()`
    select id, document_number, document_type, issued_date, valid_until,
      customer_name, currency, subtotal_usd_cents, subtotal_bs_cents, created_at
    from sales_documents
    order by created_at desc
    limit ${Math.min(Math.max(limit, 1), 100)}
  `;

  return rows.map((row) => ({
    id: Number(row.id),
    documentNumber: String(row.document_number),
    documentType: row.document_type as SalesDocumentType,
    issuedDate: String(row.issued_date).slice(0, 10),
    validUntil: String(row.valid_until).slice(0, 10),
    customerName: String(row.customer_name),
    currency: row.currency as SalesCurrency,
    totalUsd: Number(row.subtotal_usd_cents) / 100,
    totalBs: Number(row.subtotal_bs_cents) / 100,
    createdAt: new Date(row.created_at as string).toISOString(),
  }));
}

export async function getSalesDocument(id: number): Promise<SalesDocumentDetail | null> {
  await ensureCatalogSchema();
  const sql = db();
  const [documents, items] = await Promise.all([
    sql`
      select id, document_number, document_type, issued_date, valid_until,
        customer_name, customer_tax_id, customer_phone, customer_address,
        seller_name, payment_method, currency, exchange_rate_e4, notes,
        subtotal_usd_cents, subtotal_bs_cents, created_at
      from sales_documents where id = ${id} limit 1
    `,
    sql`
      select product_name, sku, quantity, unit_price_usd_cents, unit_price_bs_cents,
        line_total_usd_cents, line_total_bs_cents
      from sales_document_items where document_id = ${id}
      order by sort_order asc, id asc
    `,
  ]);

  const row = documents[0];
  if (!row) return null;

  return {
    id: Number(row.id),
    documentNumber: String(row.document_number),
    documentType: row.document_type as SalesDocumentType,
    issuedDate: String(row.issued_date).slice(0, 10),
    validUntil: String(row.valid_until).slice(0, 10),
    customerName: String(row.customer_name),
    customerTaxId: row.customer_tax_id ? String(row.customer_tax_id) : null,
    customerPhone: row.customer_phone ? String(row.customer_phone) : null,
    customerAddress: row.customer_address ? String(row.customer_address) : null,
    sellerName: String(row.seller_name),
    paymentMethod: String(row.payment_method),
    currency: row.currency as SalesCurrency,
    exchangeRate: Number(row.exchange_rate_e4) / 10000,
    notes: row.notes ? String(row.notes) : null,
    totalUsd: Number(row.subtotal_usd_cents) / 100,
    totalBs: Number(row.subtotal_bs_cents) / 100,
    createdAt: new Date(row.created_at as string).toISOString(),
    items: items.map((item) => ({
      productName: String(item.product_name),
      sku: item.sku ? String(item.sku) : null,
      quantity: Number(item.quantity),
      unitPriceUsd: Number(item.unit_price_usd_cents) / 100,
      unitPriceBs: Number(item.unit_price_bs_cents) / 100,
      lineTotalUsd: Number(item.line_total_usd_cents) / 100,
      lineTotalBs: Number(item.line_total_bs_cents) / 100,
    })),
  };
}
