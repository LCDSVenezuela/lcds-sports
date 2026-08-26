import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getAdminSession();
        if (!session) throw new Error("No autorizado");

        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        const requestedFolder = String(payload?.folder || "media")
          .toLowerCase()
          .replace(/[^a-z0-9/_-]+/g, "-")
          .replace(/^\/+|\/+$/g, "");

        if (!pathname.startsWith(`${requestedFolder}/`)) {
          throw new Error("Ruta de carga inválida");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.userId,
            folder: requestedFolder,
          }),
        };
      },
      onUploadCompleted: async () => {
        // La URL resultante se guarda al confirmar el formulario de producto o marketing.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen";
    return NextResponse.json({ error: message }, { status: message === "No autorizado" ? 401 : 400 });
  }
}
