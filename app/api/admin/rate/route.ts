import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { updateBcvRate } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rate = Number(body?.rate);

  if (!Number.isFinite(rate) || rate <= 0) {
    return NextResponse.json({ ok: false, error: "La tasa debe ser mayor que 0" }, { status: 400 });
  }

  try {
    await updateBcvRate(rate);
    return NextResponse.json({ ok: true, rate });
  } catch (error) {
    console.error("No se pudo actualizar la tasa BCV", error);
    return NextResponse.json({ ok: false, error: "No se pudo actualizar la tasa BCV" }, { status: 500 });
  }
}
