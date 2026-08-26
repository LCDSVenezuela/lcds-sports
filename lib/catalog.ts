import { db, ensureCatalogSchema } from "@/lib/db";

export type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  subtitle: string | null;
  image: string | null;
  badge: string | null;
  priceUsd: number;
  bcvReferenceUsd: number;
  stock: number;
  featured: boolean;
};

export type CatalogSnapshot = {
  rateBcv: number;
  products: CatalogProduct[];
};

function mapProduct(row: Record<string, unknown>): CatalogProduct {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    brand: String(row.brand),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    image: row.image ? String(row.image) : null,
    badge: row.badge ? String(row.badge) : null,
    priceUsd: Number(row.price_usd_cents) / 100,
    bcvReferenceUsd: Number(row.bcv_reference_usd_cents) / 100,
    stock: Number(row.stock),
    featured: Boolean(row.featured),
  };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  await ensureCatalogSchema();
  const sql = db();

  const [rateRows, productRows] = await Promise.all([
    sql`
      select rate_e4
      from exchange_rates
      where currency = 'USD' and active = true
      order by created_at desc
      limit 1
    `,
    sql`
      select
        id, name, slug, brand, subtitle, image, badge,
        price_usd_cents, bcv_reference_usd_cents,
        stock, featured
      from products
      where active = true
      order by sort_order asc, id asc
    `,
  ]);

  const rateE4 = rateRows[0]?.rate_e4 ? Number(rateRows[0].rate_e4) : 2500000;

  return {
    rateBcv: rateE4 / 10000,
    products: productRows.map((row) => mapProduct(row as Record<string, unknown>)),
  };
}

export async function updateBcvRate(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("La tasa BCV debe ser mayor que 0");
  }

  await ensureCatalogSchema();
  const sql = db();
  const rateE4 = Math.round(rate * 10000);

  await sql.begin(async (tx) => {
    await tx`
      update exchange_rates
      set active = false
      where currency = 'USD' and active = true
    `;

    await tx`
      insert into exchange_rates (currency, rate_e4, source, active)
      values ('USD', ${rateE4}, 'BCV', true)
    `;
  });
}
