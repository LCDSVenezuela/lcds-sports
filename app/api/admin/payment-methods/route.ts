import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { savePaymentMethods } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const methods = Array.isArray(body?.methods) ? body.methods : [];

  if (methods.length > 10) {
    return NextResponse.json({ ok: false, error: "Solo se permiten hasta 10 métodos de pago" }, { status: 400 });
  }

  try {
    await savePaymentMethods(
      methods.map((method: Record<string, unknown>) => ({
        name: String(method.name || ""),
        detail: method.detail ? String(method.detail) : null,
      })),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("No se pudieron guardar los métodos de pago", error);
    return NextResponse.json({ ok: false, error: "No se pudieron guardar los métodos de pago" }, { status: 500 });
  }
}
