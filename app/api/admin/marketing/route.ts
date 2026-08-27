import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getCatalogSnapshot, saveBanners, updateStoreSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const settings = body?.settings;
  const banners = Array.isArray(body?.banners) ? body.banners : [];

  if (!settings || typeof settings.announcementText !== "string" || typeof settings.whatsappPhone !== "string") {
    return NextResponse.json({ ok: false, error: "Configuración inválida" }, { status: 400 });
  }

  if (banners.length > 3) {
    return NextResponse.json({ ok: false, error: "Solo se permiten 3 banners" }, { status: 400 });
  }

  try {
    await updateStoreSettings({
      announcementEnabled: Boolean(settings.announcementEnabled),
      announcementText: String(settings.announcementText),
      announcementLink: settings.announcementLink ? String(settings.announcementLink) : null,
      whatsappPhone: String(settings.whatsappPhone),
      locationText: String(settings.locationText || "Portuguesa, Venezuela"),
      shippingText: String(settings.shippingText || "Envío gratis por Zoom y Tealca a toda Venezuela"),
      wholesaleTitle: String(settings.wholesaleTitle || "Ventas al mayor"),
      wholesaleText: String(settings.wholesaleText || "Consulta condiciones por cantidad."),
    });

    await saveBanners(
      banners.map((banner: Record<string, unknown>, index: number) => ({
        id: banner.id ? Number(banner.id) : undefined,
        title: banner.title ? String(banner.title) : null,
        subtitle: banner.subtitle ? String(banner.subtitle) : null,
        imageUrl: String(banner.imageUrl || ""),
        mobileImageUrl: banner.mobileImageUrl ? String(banner.mobileImageUrl) : null,
        ctaText: banner.ctaText ? String(banner.ctaText) : null,
        ctaHref: banner.ctaHref ? String(banner.ctaHref) : null,
        active: Boolean(banner.active),
        sortOrder: Number.isFinite(Number(banner.sortOrder)) ? Number(banner.sortOrder) : index + 1,
      })),
    );

    // Leemos nuevamente desde la base para confirmar cuántos banners activos
    // quedaron realmente disponibles para la portada.
    const snapshot = await getCatalogSnapshot();

    return NextResponse.json({
      ok: true,
      bannerCount: snapshot.banners.length,
    });
  } catch (error) {
    console.error("No se pudo actualizar marketing", error);
    return NextResponse.json({ ok: false, error: "No se pudieron guardar los cambios" }, { status: 500 });
  }
}
