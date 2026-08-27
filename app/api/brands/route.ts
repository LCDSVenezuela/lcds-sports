import { NextResponse } from "next/server";
import { getTaxonomies } from "@/lib/admin-taxonomy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { brands } = await getTaxonomies(false);
    return NextResponse.json({
      brands: brands
        .filter((brand) => Boolean(brand.logoUrl))
        .map((brand) => ({
          id: brand.id,
          name: brand.name,
          logoUrl: brand.logoUrl,
        })),
    });
  } catch (error) {
    console.error("No se pudieron cargar las marcas públicas", error);
    return NextResponse.json({ brands: [] });
  }
}
