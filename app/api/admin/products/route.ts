import { NextRequest, NextResponse } from "next/server";
import { saveProduct, type ProductAdminInput } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const providedKey = request.headers.get("x-admin-key");

  if (!configuredKey) {
    return NextResponse.json({ ok: false, error: "ADMIN_API_KEY no está configurada" }, { status: 503 });
  }

  if (!providedKey || providedKey !== configuredKey) {
    return NextResponse.json({ ok: false, error: "Clave administrativa inválida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });

  const input: ProductAdminInput = {
    id: body.id ? Number(body.id) : undefined,
    name: String(body.name || ""),
    slug: String(body.slug || ""),
    sku: body.sku ? String(body.sku) : null,
    brand: String(body.brand || ""),
    category: String(body.category || "Softball"),
    subtitle: body.subtitle ? String(body.subtitle) : null,
    description: body.description ? String(body.description) : null,
    badge: body.badge ? String(body.badge) : null,
    labels: Array.isArray(body.labels) ? body.labels.map(String) : [],
    priceUsd: Number(body.priceUsd),
    bcvReferenceUsd: Number(body.bcvReferenceUsd),
    stock: Number(body.stock),
    featured: Boolean(body.featured),
    rating: Number(body.rating ?? 5),
    reviewCount: Number(body.reviewCount ?? 0),
    freeShipping: Boolean(body.freeShipping),
    warrantyDays: Number(body.warrantyDays ?? 1),
    wholesaleEnabled: Boolean(body.wholesaleEnabled),
    wholesaleNote: body.wholesaleNote ? String(body.wholesaleNote) : null,
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    wholesaleTiers: Array.isArray(body.wholesaleTiers)
      ? body.wholesaleTiers.map((tier: Record<string, unknown>) => ({
          minQuantity: Number(tier.minQuantity),
          priceUsd: Number(tier.priceUsd),
          bcvReferenceUsd: Number(tier.bcvReferenceUsd),
          label: tier.label ? String(tier.label) : null,
        }))
      : [],
  };

  try {
    const id = await saveProduct(input);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("No se pudo guardar producto", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo guardar el producto" },
      { status: 500 },
    );
  }
}
