import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  deleteTaxonomyItem,
  saveTaxonomyItem,
  toggleTaxonomyItem,
  type TaxonomyKind,
} from "@/lib/admin-taxonomy";

export const dynamic = "force-dynamic";

function isKind(value: unknown): value is TaxonomyKind {
  return value === "brand" || value === "category";
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !isKind(body.kind)) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  try {
    if (body.action === "save") {
      const id = await saveTaxonomyItem(body.kind, {
        id: body.id ? Number(body.id) : undefined,
        name: String(body.name || ""),
        slug: body.slug ? String(body.slug) : undefined,
        active: body.active === undefined ? true : Boolean(body.active),
      });
      return NextResponse.json({ ok: true, id });
    }

    if (body.action === "toggle") {
      await toggleTaxonomyItem(body.kind, Number(body.id), Boolean(body.active));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete") {
      await deleteTaxonomyItem(body.kind, Number(body.id));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("No se pudo actualizar catálogo base", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo guardar" },
      { status: 500 },
    );
  }
}
