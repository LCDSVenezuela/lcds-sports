import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maximumSizeInBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      ...(process.env.BLOB_WEBHOOK_PUBLIC_KEY
        ? { webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY }
        : {}),
      getSignedToken: async (pathname, clientPayload) => {
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

        const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
        const storeId = process.env.BLOB_STORE_ID;

        if (!storeId && !readWriteToken) {
          throw new Error("BLOB_STORE_ID no está disponible en este entorno");
        }

        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes,
          maximumSizeInBytes,
          ...(readWriteToken ? { token: readWriteToken } : {}),
          ...(storeId ? { storeId } : {}),
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes,
            maximumSizeInBytes,
            addRandomSuffix: true,
            allowOverwrite: false,
          },
        };
      },
      onUploadCompleted: async () => {
        // La URL resultante se guarda al confirmar el formulario de producto o marketing.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen";
    console.error("LCDS Blob upload error:", message);
    return NextResponse.json({ error: message }, { status: message === "No autorizado" ? 401 : 400 });
  }
}
