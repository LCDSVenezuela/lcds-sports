import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!client) {
    client = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }

  return client;
}

export async function ensureCatalogSchema() {
  const sql = db();

  await sql`
    create table if not exists exchange_rates (
      id bigserial primary key,
      currency text not null default 'USD',
      rate_e4 integer not null,
      source text not null default 'BCV',
      active boolean not null default true,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists products (
      id bigserial primary key,
      name text not null,
      slug text not null unique,
      brand text not null,
      subtitle text,
      image text,
      badge text,
      price_usd_cents integer not null,
      bcv_reference_usd_cents integer not null,
      stock integer not null default 0,
      active boolean not null default true,
      featured boolean not null default false,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    insert into exchange_rates (currency, rate_e4, source, active)
    select 'USD', 2500000, 'BCV', true
    where not exists (
      select 1 from exchange_rates where currency = 'USD' and active = true
    )
  `;

  await sql`
    insert into products (
      name, slug, brand, subtitle, image, badge,
      price_usd_cents, bcv_reference_usd_cents,
      stock, active, featured, sort_order
    )
    values
      (
        'Pelota Softball SB-120I',
        'pelota-softball-tamanaco-sb-120i',
        'Tamanaco',
        'Importada · Bolsa Chillona',
        '/products/tamanaco-sb120i.png',
        'Más vendida',
        700,
        950,
        50,
        true,
        true,
        1
      ),
      (
        'Pack 3 SB-120I',
        'pack-3-tamanaco-sb-120i',
        'Tamanaco',
        '3 unidades',
        '/products/tamanaco-pack3.png',
        'Pack 3',
        3800,
        4200,
        20,
        true,
        false,
        2
      )
    on conflict (slug) do nothing
  `;
}
