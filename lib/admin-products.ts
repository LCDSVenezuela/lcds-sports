import { db, ensureCatalogSchema } from "@/lib/db";

export type ProductAdminInput = {
  id?: number;
  name: string;
  slug: string;
  sku?: string | null;
  brand: string;
  category: string;
  subtitle?: string | null;
  description?: string | null;
  badge?: string | null;
  labels: string[];
  priceUsd: number;
  bcvReferenceUsd: number;
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  freeShipping: boolean;
  warrantyDays: number;
  wholesaleEnabled: boolean;
  wholesaleNote?: string | null;
  images: string[];
  wholesaleTiers: Array<{
    minQuantity: number;
    priceUsd: number;
    bcvReferenceUsd: number;
    label?: string | null;
  }>;
};

export type AdminProductListItem = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  brand: string;
  category: string;
  image: string | null;
  badge: string | null;
  priceUsd: number;
  bcvReferenceUsd: number;
  stock: number;
  active: boolean;
  featured: boolean;
  rating: number;
  sortOrder: number;
};

function validateProduct(input: ProductAdminInput) {
  if (!input.name.trim()) throw new Error("El nombre es obligatorio");
  if (!input.slug.trim()) throw new Error("El slug es obligatorio");
  if (!input.brand.trim()) throw new Error("La marca es obligatoria");
  if (!Number.isFinite(input.priceUsd) || input.priceUsd < 0) throw new Error("Precio USD inválido");
  if (!Number.isFinite(input.bcvReferenceUsd) || input.bcvReferenceUsd < 0) throw new Error("Referencia BCV inválida");
  if (!Number.isFinite(input.stock) || input.stock < 0) throw new Error("Stock inválido");
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  await ensureCatalogSchema();
  const rows = await db()`
    select
      id, name, slug, sku, brand, category, image, badge,
      price_usd_cents, bcv_reference_usd_cents, stock,
      active, featured, rating_e2, sort_order
    from products
    order by sort_order asc, id asc
  `;

  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    sku: row.sku ? String(row.sku) : null,
    brand: String(row.brand),
    category: String(row.category ?? "Softball"),
    image: row.image ? String(row.image) : null,
    badge: row.badge ? String(row.badge) : null,
    priceUsd: Number(row.price_usd_cents) / 100,
    bcvReferenceUsd: Number(row.bcv_reference_usd_cents) / 100,
    stock: Number(row.stock),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    rating: Number(row.rating_e2 ?? 0) / 100,
    sortOrder: Number(row.sort_order ?? 0),
  }));
}

export async function setProductActive(id: number, active: boolean) {
  await ensureCatalogSchema();
  const rows = await db()`
    update products
    set active = ${active}, updated_at = now()
    where id = ${id}
    returning id
  `;
  if (!rows[0]) throw new Error("Producto no encontrado");
}

export async function setProductStock(id: number, stock: number) {
  if (!Number.isFinite(stock) || stock < 0) throw new Error("Stock inválido");
  await ensureCatalogSchema();
  const rows = await db()`
    update products
    set stock = ${Math.round(stock)}, updated_at = now()
    where id = ${id}
    returning id
  `;
  if (!rows[0]) throw new Error("Producto no encontrado");
}

export async function moveProduct(id: number, direction: "up" | "down") {
  await ensureCatalogSchema();
  const sql = db();

  await sql.begin(async (tx) => {
    const currentRows = await tx`
      select id, sort_order
      from products
      where id = ${id}
      limit 1
    `;
    const current = currentRows[0];
    if (!current) throw new Error("Producto no encontrado");

    const targetRows = direction === "up"
      ? await tx`
          select id, sort_order
          from products
          where sort_order < ${Number(current.sort_order)}
             or (sort_order = ${Number(current.sort_order)} and id < ${id})
          order by sort_order desc, id desc
          limit 1
        `
      : await tx`
          select id, sort_order
          from products
          where sort_order > ${Number(current.sort_order)}
             or (sort_order = ${Number(current.sort_order)} and id > ${id})
          order by sort_order asc, id asc
          limit 1
        `;

    const target = targetRows[0];
    if (!target) return;

    const currentOrder = Number(current.sort_order);
    const targetOrder = Number(target.sort_order);

    await tx`update products set sort_order = ${targetOrder}, updated_at = now() where id = ${id}`;
    await tx`update products set sort_order = ${currentOrder}, updated_at = now() where id = ${Number(target.id)}`;
  });
}

export async function deleteProduct(id: number) {
  await ensureCatalogSchema();
  const rows = await db()`
    delete from products
    where id = ${id}
    returning id
  `;
  if (!rows[0]) throw new Error("Producto no encontrado");
}

export async function saveProduct(input: ProductAdminInput) {
  validateProduct(input);
  await ensureCatalogSchema();
  const sql = db();

  const cleanImages = input.images.map((item) => item.trim()).filter(Boolean).slice(0, 10);
  const primaryImage = cleanImages[0] || null;
  const labels = input.labels.map((item) => item.trim()).filter(Boolean).slice(0, 8).join("|");
  const priceUsdCents = Math.round(input.priceUsd * 100);
  const bcvReferenceUsdCents = Math.round(input.bcvReferenceUsd * 100);
  const ratingE2 = Math.round(Math.max(0, Math.min(5, input.rating)) * 100);

  return sql.begin(async (tx) => {
    let productId: number;

    if (input.id) {
      const rows = await tx`
        update products
        set
          name = ${input.name.trim()},
          slug = ${input.slug.trim()},
          sku = ${input.sku?.trim() || null},
          brand = ${input.brand.trim()},
          category = ${input.category.trim() || "Softball"},
          subtitle = ${input.subtitle?.trim() || null},
          description = ${input.description?.trim() || null},
          image = ${primaryImage},
          badge = ${input.badge?.trim() || null},
          labels = ${labels},
          price_usd_cents = ${priceUsdCents},
          bcv_reference_usd_cents = ${bcvReferenceUsdCents},
          stock = ${Math.round(input.stock)},
          featured = ${input.featured},
          rating_e2 = ${ratingE2},
          review_count = ${Math.max(0, Math.round(input.reviewCount))},
          free_shipping = ${input.freeShipping},
          warranty_days = ${Math.max(0, Math.round(input.warrantyDays))},
          wholesale_enabled = ${input.wholesaleEnabled},
          wholesale_note = ${input.wholesaleNote?.trim() || null},
          updated_at = now()
        where id = ${input.id}
        returning id
      `;
      if (!rows[0]) throw new Error("Producto no encontrado");
      productId = Number(rows[0].id);
    } else {
      const rows = await tx`
        insert into products (
          name, slug, sku, brand, category, subtitle, description, image, badge, labels,
          price_usd_cents, bcv_reference_usd_cents, stock, active, featured,
          rating_e2, review_count, free_shipping, warranty_days,
          wholesale_enabled, wholesale_note, sort_order
        )
        values (
          ${input.name.trim()},
          ${input.slug.trim()},
          ${input.sku?.trim() || null},
          ${input.brand.trim()},
          ${input.category.trim() || "Softball"},
          ${input.subtitle?.trim() || null},
          ${input.description?.trim() || null},
          ${primaryImage},
          ${input.badge?.trim() || null},
          ${labels},
          ${priceUsdCents},
          ${bcvReferenceUsdCents},
          ${Math.round(input.stock)},
          true,
          ${input.featured},
          ${ratingE2},
          ${Math.max(0, Math.round(input.reviewCount))},
          ${input.freeShipping},
          ${Math.max(0, Math.round(input.warrantyDays))},
          ${input.wholesaleEnabled},
          ${input.wholesaleNote?.trim() || null},
          coalesce((select max(sort_order) + 1 from products), 1)
        )
        returning id
      `;
      productId = Number(rows[0].id);
    }

    await tx`delete from product_images where product_id = ${productId}`;
    for (let index = 0; index < cleanImages.length; index += 1) {
      await tx`
        insert into product_images (product_id, image_url, alt_text, sort_order)
        values (${productId}, ${cleanImages[index]}, ${input.name.trim()}, ${index})
      `;
    }

    await tx`delete from wholesale_tiers where product_id = ${productId}`;
    if (input.wholesaleEnabled) {
      for (let index = 0; index < input.wholesaleTiers.length; index += 1) {
        const tier = input.wholesaleTiers[index];
        if (!Number.isFinite(tier.minQuantity) || tier.minQuantity <= 0) continue;
        if (!Number.isFinite(tier.priceUsd) || tier.priceUsd < 0) continue;
        if (!Number.isFinite(tier.bcvReferenceUsd) || tier.bcvReferenceUsd < 0) continue;

        await tx`
          insert into wholesale_tiers (
            product_id, min_quantity, price_usd_cents,
            bcv_reference_usd_cents, label, sort_order
          )
          values (
            ${productId},
            ${Math.round(tier.minQuantity)},
            ${Math.round(tier.priceUsd * 100)},
            ${Math.round(tier.bcvReferenceUsd * 100)},
            ${tier.label?.trim() || null},
            ${index + 1}
          )
        `;
      }
    }

    return productId;
  });
}
