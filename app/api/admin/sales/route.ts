import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createSalesDocument } from "@/lib/sales";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Solicitud no válida" }, { status: 400 });

  try {
    const document = await createSalesDocument({
      ...body,
      items: Array.isArray(body.items) ? body.items : [],
      createdBy: session.userId,
    });

    return NextResponse.json({
      ok: true,
      document,
      pdfUrl: `/api/admin/sales/${document.id}/pdf`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el documento";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
