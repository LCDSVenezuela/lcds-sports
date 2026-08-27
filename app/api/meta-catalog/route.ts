import { getCatalogSnapshot } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://lcds-sports.vercel.app").replace(/\/$/, "");

function csvCell(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export async function GET() {
  try {
    const snapshot = await getCatalogSnapshot();

    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
    ];

    const rows = snapshot.products
      .map((product) => {
        const image = product.images[0]?.imageUrl || product.image;
        if (!image) return null;

        const description =
          product.description?.trim() ||
          product.subtitle?.trim() ||
          `${product.name} de ${product.brand}`;

        return [
          `lcds-${product.id}`,
          product.name,
          description,
          product.stock > 0 ? "in stock" : "out of stock",
          "new",
          `${product.priceUsd.toFixed(2)} USD`,
          `${SITE_URL}/producto/${encodeURIComponent(product.slug)}`,
          absoluteUrl(image),
          product.brand,
        ].map(csvCell);
      })
      .filter((row): row is string[] => Boolean(row));

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'inline; filename="lcds-meta-catalog.csv"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Meta catalog feed error", error);
    return new Response("Catalog feed temporarily unavailable", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}
