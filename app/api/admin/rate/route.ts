import { NextRequest, NextResponse } from "next/server";
import { updateBcvRate } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const providedKey = request.headers.get("x-admin-key");

  if (!configuredKey) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_API_KEY no está configurada" },
      { status: 503 },
    );
  }

  if (!providedKey || providedKey !== configuredKey) {
    return NextResponse.json(
      { ok: false, error: "Clave administrativa inválida" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const rate = Number(body?.rate);

  if (!Number.isFinite(rate) || rate <= 0) {
    return NextResponse.json(
      { ok: false, error: "La tasa debe ser mayor que 0" },
      { status: 400 },
    );
  }

  try {
    await updateBcvRate(rate);
    return NextResponse.json({ ok: true, rate });
  } catch (error) {
    console.error("No se pudo actualizar la tasa BCV", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo actualizar la tasa BCV" },
      { status: 500 },
    );
  }
}
