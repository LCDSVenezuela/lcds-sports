import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { deleteProduct, moveProduct, setProductActive, setProductStock } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Producto inválido");
  return id;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "active") {
      await setProductActive(id, Boolean(body.active));
    } else if (action === "stock") {
      await setProductStock(id, Number(body.stock));
    } else if (action === "move") {
      const direction = body.direction === "down" ? "down" : "up";
      await moveProduct(id, direction);
    } else {
      return NextResponse.json({ ok: false, error: "Acción no soportada" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo actualizar el producto" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    await deleteProduct(parseId(rawId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo eliminar el producto" },
      { status: 500 },
    );
  }
}
