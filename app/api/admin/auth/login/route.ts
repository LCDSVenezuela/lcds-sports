import { NextResponse } from "next/server";
import { loginAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "");
  const password = String(body?.password || "");

  try {
    const session = await loginAdmin(email, password);
    return NextResponse.json({ ok: true, email: session.email });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo iniciar sesión" },
      { status: 401 },
    );
  }
}
