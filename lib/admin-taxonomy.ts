import { db, ensureCatalogSchema } from "@/lib/db";

export type TaxonomyKind = "brand" | "category";

export type TaxonomyItem = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureTaxonomySchema() {
  await ensureCatalogSchema();
  const sql = db();

  await sql`
    create table if not exists catalog_brands (
      id bigserial primary key,
      name text not null unique,
      slug text not null unique,
      active boolean not null default true,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists catalog_categories (
      id bigserial primary key,
      name text not null unique,
      slug text not null unique,
      active boolean not null default true,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    insert into catalog_brands (name, slug, active, sort_order)
    select distinct trim(brand), lower(regexp_replace(trim(brand), '[^a-zA-Z0-9]+', '-', 'g')), true, 0
    from products
    where trim(coalesce(brand, '')) <> ''
    on conflict do nothing
  `;

  await sql`
    insert into catalog_categories (name, slug, active, sort_order)
    select distinct trim(category), lower(regexp_replace(trim(category), '[^a-zA-Z0-9]+', '-', 'g')), true, 0
    from products
    where trim(coalesce(category, '')) <> ''
    on conflict do nothing
  `;
}

function mapRows(rows: Array<Record<string, unknown>>): TaxonomyItem[] {
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
  }));
}

export async function getTaxonomies(includeInactive = true) {
  await ensureTaxonomySchema();
  const sql = db();

  const [brandRows, categoryRows] = await Promise.all([
    includeInactive
      ? sql`select id, name, slug, active, sort_order from catalog_brands order by active desc, sort_order asc, name asc`
      : sql`select id, name, slug, active, sort_order from catalog_brands where active = true order by sort_order asc, name asc`,
    includeInactive
      ? sql`select id, name, slug, active, sort_order from catalog_categories order by active desc, sort_order asc, name asc`
      : sql`select id, name, slug, active, sort_order from catalog_categories where active = true order by sort_order asc, name asc`,
  ]);

  return {
    brands: mapRows(brandRows as Array<Record<string, unknown>>),
    categories: mapRows(categoryRows as Array<Record<string, unknown>>),
  };
}

export async function saveTaxonomyItem(kind: TaxonomyKind, input: { id?: number; name: string; slug?: string; active?: boolean }) {
  await ensureTaxonomySchema();
  const sql = db();
  const name = input.name.trim();
  const slug = slugify(input.slug?.trim() || name);

  if (!name) throw new Error("El nombre es obligatorio");
  if (!slug) throw new Error("No se pudo generar el identificador");

  if (kind === "brand") {
    if (input.id) {
      return sql.begin(async (tx) => {
        const current = await tx`select name from catalog_brands where id = ${input.id} limit 1`;
        if (!current[0]) throw new Error("Marca no encontrada");
        const oldName = String(current[0].name);
        const rows = await tx`
          update catalog_brands
          set name = ${name}, slug = ${slug}, active = ${input.active ?? true}, updated_at = now()
          where id = ${input.id}
          returning id
        `;
        if (oldName !== name) await tx`update products set brand = ${name}, updated_at = now() where brand = ${oldName}`;
        return Number(rows[0].id);
      });
    }
    const rows = await sql`
      insert into catalog_brands (name, slug, active, sort_order)
      values (${name}, ${slug}, ${input.active ?? true}, coalesce((select max(sort_order) + 1 from catalog_brands), 1))
      returning id
    `;
    return Number(rows[0].id);
  }

  if (input.id) {
    return sql.begin(async (tx) => {
      const current = await tx`select name from catalog_categories where id = ${input.id} limit 1`;
      if (!current[0]) throw new Error("Categoría no encontrada");
      const oldName = String(current[0].name);
      const rows = await tx`
        update catalog_categories
        set name = ${name}, slug = ${slug}, active = ${input.active ?? true}, updated_at = now()
        where id = ${input.id}
        returning id
      `;
      if (oldName !== name) await tx`update products set category = ${name}, updated_at = now() where category = ${oldName}`;
      return Number(rows[0].id);
    });
  }

  const rows = await sql`
    insert into catalog_categories (name, slug, active, sort_order)
    values (${name}, ${slug}, ${input.active ?? true}, coalesce((select max(sort_order) + 1 from catalog_categories), 1))
    returning id
  `;
  return Number(rows[0].id);
}

export async function toggleTaxonomyItem(kind: TaxonomyKind, id: number, active: boolean) {
  await ensureTaxonomySchema();
  const sql = db();

  if (kind === "brand") {
    await sql`update catalog_brands set active = ${active}, updated_at = now() where id = ${id}`;
  } else {
    await sql`update catalog_categories set active = ${active}, updated_at = now() where id = ${id}`;
  }
}

export async function deleteTaxonomyItem(kind: TaxonomyKind, id: number) {
  await ensureTaxonomySchema();
  const sql = db();

  if (kind === "brand") {
    const rows = await sql`select name from catalog_brands where id = ${id} limit 1`;
    if (!rows[0]) return;
    const usage = await sql`select count(*)::int as count from products where brand = ${String(rows[0].name)}`;
    if (Number(usage[0]?.count ?? 0) > 0) throw new Error("Esta marca está usada por productos. Desactívala en lugar de eliminarla.");
    await sql`delete from catalog_brands where id = ${id}`;
    return;
  }

  const rows = await sql`select name from catalog_categories where id = ${id} limit 1`;
  if (!rows[0]) return;
  const usage = await sql`select count(*)::int as count from products where category = ${String(rows[0].name)}`;
  if (Number(usage[0]?.count ?? 0) > 0) throw new Error("Esta categoría está usada por productos. Desactívala en lugar de eliminarla.");
  await sql`delete from catalog_categories where id = ${id}`;
}
