import { db, ensureCatalogSchema } from "@/lib/db";

export type ProductImage = {
  id: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type WholesaleTier = {
  id: number;
  minQuantity: number;
  priceUsd: number;
  bcvReferenceUsd: number;
  label: string | null;
};

export type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  brand: string;
  category: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  badge: string | null;
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
  wholesaleNote: string | null;
  images: ProductImage[];
  wholesaleTiers: WholesaleTier[];
};

export type StoreBanner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  active: boolean;
  sortOrder: number;
};

export type PaymentMethod = {
  id: number;
  name: string;
  detail: string | null;
};

export type StoreSettings = {
  announcementEnabled: boolean;
  announcementText: string;
  announcementMessages: string[];
  announcementLink: string | null;
  whatsappPhone: string;
  locationText: string;
  shippingText: string;
  wholesaleTitle: string;
  wholesaleText: string;
};

export type CatalogSnapshot = {
  rateBcv: number;
  products: CatalogProduct[];
  banners: StoreBanner[];
  settings: StoreSettings;
  paymentMethods: PaymentMethod[];
};

function splitLabels(value: unknown) {
  return String(value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitAnnouncementMessages(value: unknown, fallback: string) {
  const messages = String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  return messages.length ? messages : [fallback];
}

function mapProduct(
  row: Record<string, unknown>,
  images: ProductImage[],
  wholesaleTiers: WholesaleTier[],
): CatalogProduct {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    sku: row.sku ? String(row.sku) : null,
    brand: String(row.brand),
    category: String(row.category ?? "Softball"),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    description: row.description ? String(row.description) : null,
    image: row.image ? String(row.image) : null,
    badge: row.badge ? String(row.badge) : null,
    labels: splitLabels(row.labels),
    priceUsd: Number(row.price_usd_cents) / 100,
    bcvReferenceUsd: Number(row.bcv_reference_usd_cents) / 100,
    stock: Number(row.stock),
    featured: Boolean(row.featured),
    rating: Number(row.rating_e2 ?? 0) / 100,
    reviewCount: Number(row.review_count ?? 0),
    freeShipping: Boolean(row.free_shipping),
    warrantyDays: Number(row.warranty_days ?? 0),
    wholesaleEnabled: Boolean(row.wholesale_enabled),
    wholesaleNote: row.wholesale_note ? String(row.wholesale_note) : null,
    images,
    wholesaleTiers,
  };
}

async function loadStoreData() {
  await ensureCatalogSchema();
  const sql = db();

  const [rateRows, productRows, imageRows, wholesaleRows, bannerRows, settingsRows, paymentRows] =
    await Promise.all([
      sql`
        select rate_e4
        from exchange_rates
        where currency = 'USD' and active = true
        order by created_at desc
        limit 1
      `,
      sql`
        select
          id, name, slug, sku, brand, category, subtitle, description,
          image, badge, labels, price_usd_cents, bcv_reference_usd_cents,
          stock, featured, rating_e2, review_count, free_shipping,
          warranty_days, wholesale_enabled, wholesale_note
        from products
        where active = true
        order by sort_order asc, id asc
      `,
      sql`
        select id, product_id, image_url, alt_text, sort_order
        from product_images
        order by product_id asc, sort_order asc, id asc
      `,
      sql`
        select id, product_id, min_quantity, price_usd_cents,
          bcv_reference_usd_cents, label, sort_order
        from wholesale_tiers
        order by product_id asc, sort_order asc, min_quantity asc
      `,
      sql`
        select id, title, subtitle, image_url, mobile_image_url,
          cta_text, cta_href, active, sort_order
        from banners
        where active = true
        order by sort_order asc, id asc
        limit 3
      `,
      sql`
        select announcement_enabled, announcement_text, announcement_messages, announcement_link,
          whatsapp_phone, location_text, shipping_text,
          wholesale_title, wholesale_text
        from store_settings
        where id = 1
        limit 1
      `,
      sql`
        select id, name, detail
        from payment_methods
        where active = true
        order by sort_order asc, id asc
      `,
    ]);

  const imagesByProduct = new Map<number, ProductImage[]>();
  for (const row of imageRows) {
    const productId = Number(row.product_id);
    const list = imagesByProduct.get(productId) ?? [];
    list.push({
      id: Number(row.id),
      imageUrl: String(row.image_url),
      altText: row.alt_text ? String(row.alt_text) : null,
      sortOrder: Number(row.sort_order),
    });
    imagesByProduct.set(productId, list);
  }

  const wholesaleByProduct = new Map<number, WholesaleTier[]>();
  for (const row of wholesaleRows) {
    const productId = Number(row.product_id);
    const list = wholesaleByProduct.get(productId) ?? [];
    list.push({
      id: Number(row.id),
      minQuantity: Number(row.min_quantity),
      priceUsd: Number(row.price_usd_cents) / 100,
      bcvReferenceUsd: Number(row.bcv_reference_usd_cents) / 100,
      label: row.label ? String(row.label) : null,
    });
    wholesaleByProduct.set(productId, list);
  }

  const products = productRows.map((row) => {
    const id = Number(row.id);
    return mapProduct(
      row as Record<string, unknown>,
      imagesByProduct.get(id) ?? [],
      wholesaleByProduct.get(id) ?? [],
    );
  });

  const rateE4 = rateRows[0]?.rate_e4 ? Number(rateRows[0].rate_e4) : 2500000;
  const settingsRow = settingsRows[0];
  const announcementText = String(settingsRow?.announcement_text ?? "Envíos a toda Venezuela");

  const settings: StoreSettings = {
    announcementEnabled: Boolean(settingsRow?.announcement_enabled ?? true),
    announcementText,
    announcementMessages: splitAnnouncementMessages(settingsRow?.announcement_messages, announcementText),
    announcementLink: settingsRow?.announcement_link ? String(settingsRow.announcement_link) : null,
    whatsappPhone: String(settingsRow?.whatsapp_phone ?? "584225329551"),
    locationText: String(settingsRow?.location_text ?? "Portuguesa, Venezuela"),
    shippingText: String(settingsRow?.shipping_text ?? "Envíos a toda Venezuela"),
    wholesaleTitle: String(
      settingsRow?.wholesale_title ?? "Precios especiales para equipos, academias y comercios",
    ),
    wholesaleText: String(
      settingsRow?.wholesale_text ?? "Consulta condiciones especiales por cantidad.",
    ),
  };

  const banners: StoreBanner[] = bannerRows.map((row) => ({
    id: Number(row.id),
    title: row.title ? String(row.title) : null,
    subtitle: row.subtitle ? String(row.subtitle) : null,
    imageUrl: String(row.image_url),
    mobileImageUrl: row.mobile_image_url ? String(row.mobile_image_url) : null,
    ctaText: row.cta_text ? String(row.cta_text) : null,
    ctaHref: row.cta_href ? String(row.cta_href) : null,
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order),
  }));

  const paymentMethods: PaymentMethod[] = paymentRows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    detail: row.detail ? String(row.detail) : null,
  }));

  return { rateBcv: rateE4 / 10000, products, banners, settings, paymentMethods };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  return loadStoreData();
}

export async function getProductBySlug(slug: string) {
  const snapshot = await loadStoreData();
  const product = snapshot.products.find((item) => item.slug === slug) ?? null;
  return { ...snapshot, product };
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

export async function updateStoreSettings(input: {
  announcementEnabled: boolean;
  announcementText: string;
  announcementMessages: string[];
  announcementLink?: string | null;
  whatsappPhone: string;
  locationText: string;
  shippingText: string;
  wholesaleTitle: string;
  wholesaleText: string;
}) {
  await ensureCatalogSchema();
  const sql = db();
  const messages = input.announcementMessages
    .map((message) => message.replace(/\r?\n/g, " ").trim())
    .filter(Boolean)
    .slice(0, 8);
  const firstMessage = messages[0] || input.announcementText.trim() || "Envíos a toda Venezuela";

  await sql`
    update store_settings
    set
      announcement_enabled = ${input.announcementEnabled},
      announcement_text = ${firstMessage},
      announcement_messages = ${messages.join("\n")},
      announcement_link = ${input.announcementLink?.trim() || null},
      whatsapp_phone = ${input.whatsappPhone.trim()},
      location_text = ${input.locationText.trim()},
      shipping_text = ${input.shippingText.trim()},
      wholesale_title = ${input.wholesaleTitle.trim()},
      wholesale_text = ${input.wholesaleText.trim()},
      updated_at = now()
    where id = 1
  `;
}

export async function saveBanners(
  banners: Array<{
    id?: number;
    title?: string | null;
    subtitle?: string | null;
    imageUrl: string;
    mobileImageUrl?: string | null;
    ctaText?: string | null;
    ctaHref?: string | null;
    active: boolean;
    sortOrder: number;
  }>,
) {
  await ensureCatalogSchema();
  const sql = db();
  const normalized = banners.slice(0, 3);

  await sql.begin(async (tx) => {
    await tx`delete from banners`;

    for (const banner of normalized) {
      if (!banner.imageUrl.trim()) continue;
      await tx`
        insert into banners (
          title, subtitle, image_url, mobile_image_url,
          cta_text, cta_href, active, sort_order, updated_at
        )
        values (
          ${banner.title?.trim() || null},
          ${banner.subtitle?.trim() || null},
          ${banner.imageUrl.trim()},
          ${banner.mobileImageUrl?.trim() || null},
          ${banner.ctaText?.trim() || null},
          ${banner.ctaHref?.trim() || null},
          ${banner.active},
          ${banner.sortOrder},
          now()
        )
      `;
    }
  });
}

export async function savePaymentMethods(
  methods: Array<{ name: string; detail?: string | null }>,
) {
  await ensureCatalogSchema();
  const sql = db();
  const normalized = methods
    .map((method) => ({
      name: method.name.trim(),
      detail: method.detail?.trim() || null,
    }))
    .filter((method) => method.name)
    .slice(0, 10);

  await sql.begin(async (tx) => {
    await tx`delete from payment_methods`;

    for (let index = 0; index < normalized.length; index += 1) {
      const method = normalized[index];
      await tx`
        insert into payment_methods (name, detail, active, sort_order)
        values (${method.name}, ${method.detail}, true, ${index + 1})
      `;
    }
  });
}
