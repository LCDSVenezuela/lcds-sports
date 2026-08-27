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

  await sql`alter table products add column if not exists sku text`;
  await sql`alter table products add column if not exists category text not null default 'Softball'`;
  await sql`alter table products add column if not exists description text`;
  await sql`alter table products add column if not exists rating_e2 integer not null default 500`;
  await sql`alter table products add column if not exists review_count integer not null default 0`;
  await sql`alter table products add column if not exists labels text not null default ''`;
  await sql`alter table products add column if not exists free_shipping boolean not null default true`;
  await sql`alter table products add column if not exists warranty_days integer not null default 1`;
  await sql`alter table products add column if not exists wholesale_enabled boolean not null default true`;
  await sql`alter table products add column if not exists wholesale_note text`;

  await sql`
    create table if not exists product_images (
      id bigserial primary key,
      product_id bigint not null references products(id) on delete cascade,
      image_url text not null,
      alt_text text,
      sort_order integer not null default 0,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists wholesale_tiers (
      id bigserial primary key,
      product_id bigint not null references products(id) on delete cascade,
      min_quantity integer not null,
      price_usd_cents integer not null,
      bcv_reference_usd_cents integer not null,
      label text,
      sort_order integer not null default 0
    )
  `;

  await sql`
    create table if not exists store_settings (
      id integer primary key,
      announcement_enabled boolean not null default true,
      announcement_text text not null default 'Envío GRATIS por Zoom y Tealca · Atención directa por WhatsApp',
      announcement_link text,
      whatsapp_phone text not null default '584225329551',
      location_text text not null default 'Portuguesa, Venezuela',
      shipping_text text not null default 'Envío gratis por Zoom y Tealca a toda Venezuela',
      wholesale_title text not null default 'Precios especiales para equipos, academias y comercios',
      wholesale_text text not null default 'Consulta condiciones por cantidad y recibe atención personalizada.',
      updated_at timestamptz not null default now()
    )
  `;

  await sql`alter table store_settings add column if not exists announcement_messages text not null default ''`;
  await sql`alter table store_settings add column if not exists business_hours text not null default ''`;
  await sql`alter table store_settings add column if not exists instagram_url text`;
  await sql`alter table store_settings add column if not exists tiktok_url text`;
  await sql`alter table store_settings add column if not exists facebook_url text`;

  await sql`
    create table if not exists banners (
      id bigserial primary key,
      title text,
      subtitle text,
      image_url text not null,
      mobile_image_url text,
      cta_text text,
      cta_href text,
      active boolean not null default true,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists payment_methods (
      id bigserial primary key,
      name text not null unique,
      detail text,
      active boolean not null default true,
      sort_order integer not null default 0
    )
  `;

  await sql`
    create table if not exists admin_users (
      id bigserial primary key,
      email text not null unique,
      password_hash text not null,
      password_salt text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists admin_sessions (
      id text primary key,
      user_id bigint not null references admin_users(id) on delete cascade,
      token_hash text not null unique,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `;

  await sql`create index if not exists admin_sessions_user_id_idx on admin_sessions(user_id)`;
  await sql`create index if not exists admin_sessions_expires_at_idx on admin_sessions(expires_at)`;

  await sql`
    insert into store_settings (id)
    values (1)
    on conflict (id) do nothing
  `;

  await sql`
    update store_settings
    set
      announcement_text = case
        when announcement_text in ('Envíos a toda Venezuela', 'Envíos a toda Venezuela · Atención directa por WhatsApp')
          then 'Envío GRATIS por Zoom y Tealca · Atención directa por WhatsApp'
        else announcement_text
      end,
      announcement_messages = case
        when trim(coalesce(announcement_messages, '')) = '' then
          case
            when announcement_text not in (
              'Envíos a toda Venezuela',
              'Envíos a toda Venezuela · Atención directa por WhatsApp',
              'Envío GRATIS por Zoom y Tealca · Atención directa por WhatsApp'
            ) then concat_ws(E'\n',
              announcement_text,
              'Envío GRATIS por Zoom y Tealca a toda Venezuela',
              'Precios en USD y Bs. con tasa vigente',
              'Ventas al mayor para equipos, academias y comercios',
              'Atención directa por WhatsApp'
            )
            else concat_ws(E'\n',
              'Envío GRATIS por Zoom y Tealca a toda Venezuela',
              'Precios en USD y Bs. con tasa vigente',
              'Ventas al mayor para equipos, academias y comercios',
              'Atención directa por WhatsApp'
            )
          end
        else announcement_messages
      end,
      shipping_text = case
        when shipping_text in ('Envíos a toda Venezuela', 'Envíos a toda Venezuela por MRW, Zoom y Tealca')
          then 'Envío gratis por Zoom y Tealca a toda Venezuela'
        else shipping_text
      end,
      updated_at = now()
    where id = 1
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
      stock, active, featured, sort_order,
      sku, category, description, rating_e2, review_count, labels,
      free_shipping, warranty_days, wholesale_enabled, wholesale_note
    )
    values
      (
        'Pelota Softball Tamanaco SB-120I',
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
        1,
        'TAM-SB120I-1',
        'Pelotas',
        'Pelota de softball Tamanaco SB-120I importada. Diseñada para entrenamiento, juego y competencia, con excelente presencia y terminación.',
        500,
        2,
        'TOP|IMPORTADA|SOFTBALL',
        true,
        1,
        true,
        'Consulta precios especiales por cantidad para equipos, academias, comercios y revendedores.'
      ),
      (
        '3 Pelotas Softball Tamanaco SB-120I',
        'pack-3-tamanaco-sb-120i',
        'Tamanaco',
        'Pack de 3 unidades · Bolsa Chillona',
        '/products/tamanaco-pack3.png',
        'Pack 3',
        3800,
        4200,
        20,
        true,
        false,
        2,
        'TAM-SB120I-P3',
        'Pelotas',
        'Pack de 3 pelotas de softball Tamanaco SB-120I importadas, ideal para equipos, entrenamientos y reposición.',
        500,
        2,
        'PACK|IMPORTADA|SOFTBALL',
        true,
        1,
        true,
        'Disponible con condiciones especiales al mayor.'
      )
    on conflict (slug) do nothing
  `;

  await sql`
    update products
    set
      name = 'Pelota Softball Tamanaco SB-120I',
      sku = coalesce(sku, 'TAM-SB120I-1'),
      category = 'Pelotas',
      description = coalesce(description, 'Pelota de softball Tamanaco SB-120I importada. Diseñada para entrenamiento, juego y competencia, con excelente presencia y terminación.'),
      labels = case when labels = '' then 'TOP|IMPORTADA|SOFTBALL' else labels end,
      rating_e2 = case when rating_e2 = 0 then 500 else rating_e2 end,
      review_count = case when review_count = 0 then 2 else review_count end,
      wholesale_note = coalesce(wholesale_note, 'Consulta precios especiales por cantidad para equipos, academias, comercios y revendedores.')
    where slug = 'pelota-softball-tamanaco-sb-120i'
  `;

  await sql`
    update products
    set
      name = '3 Pelotas Softball Tamanaco SB-120I',
      sku = coalesce(sku, 'TAM-SB120I-P3'),
      category = 'Pelotas',
      description = coalesce(description, 'Pack de 3 pelotas de softball Tamanaco SB-120I importadas, ideal para equipos, entrenamientos y reposición.'),
      labels = case when labels = '' then 'PACK|IMPORTADA|SOFTBALL' else labels end,
      rating_e2 = case when rating_e2 = 0 then 500 else rating_e2 end,
      review_count = case when review_count = 0 then 2 else review_count end,
      wholesale_note = coalesce(wholesale_note, 'Disponible con condiciones especiales al mayor.')
    where slug = 'pack-3-tamanaco-sb-120i'
  `;

  await sql`
    insert into product_images (product_id, image_url, alt_text, sort_order)
    select p.id, p.image, p.name, 0
    from products p
    where p.image is not null
      and not exists (
        select 1 from product_images pi where pi.product_id = p.id
      )
  `;

  await sql`
    insert into wholesale_tiers (product_id, min_quantity, price_usd_cents, bcv_reference_usd_cents, label, sort_order)
    select p.id, 6, 650, 900, 'Desde 6 unidades', 1
    from products p
    where p.slug = 'pelota-softball-tamanaco-sb-120i'
      and not exists (select 1 from wholesale_tiers wt where wt.product_id = p.id)
  `;

  await sql`
    insert into payment_methods (name, detail, sort_order)
    values
      ('Zelle', 'Precio en divisas', 1),
      ('USDT', 'Precio en divisas', 2),
      ('Divisas', 'Efectivo en USD', 3),
      ('Depósito bancario', 'Precio en divisas', 4),
      ('Pago móvil', 'Monto calculado en Bs. según tasa vigente', 5),
      ('Transferencia Bs.', 'Monto calculado en Bs. según tasa vigente', 6)
    on conflict (name) do nothing
  `;

  await sql`
    insert into banners (title, subtitle, image_url, mobile_image_url, cta_text, cta_href, active, sort_order)
    select
      'La Casa del Softball',
      'Pelotas, equipamiento y artículos deportivos con envíos a toda Venezuela.',
      '/products/tamanaco-pack3.png',
      '/products/tamanaco-pack3.png',
      'Ver productos',
      '#productos',
      true,
      1
    where not exists (select 1 from banners)
  `;
}
