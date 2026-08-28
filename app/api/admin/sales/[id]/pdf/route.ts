import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { requireAdminApi } from "@/lib/admin-auth";
import { getSalesDocument } from "@/lib/sales";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;

function money(value: number, currency: "USD" | "BS") {
  return currency === "USD"
    ? `$${value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `Bs. ${value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function date(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function safeText(value: string | null | undefined) {
  return String(value ?? "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "").replace(/–|—/g, "-");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawLabel(page: PDFPage, font: PDFFont, bold: PDFFont, label: string, value: string, x: number, y: number, width: number) {
  page.drawText(label.toUpperCase(), { x, y, size: 7, font: bold, color: rgb(0.42, 0.45, 0.48) });
  const lines = wrap(value || "-", font, 9.5, width);
  lines.slice(0, 2).forEach((line, index) => page.drawText(line, { x, y: y - 13 - index * 11, size: 9.5, font, color: rgb(0.08, 0.09, 0.1) }));
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await getSalesDocument(Number(id));
  if (!document) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawHeader = () => {
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 112, width: PAGE_WIDTH, height: 112, color: rgb(0.04, 0.05, 0.06) });
    page.drawText("LCDS SPORTS", { x: MARGIN, y: PAGE_HEIGHT - 58, size: 22, font: bold, color: rgb(0.2, 0.83, 0.52) });
    page.drawText("LA CASA DEL SOFTBALL", { x: MARGIN, y: PAGE_HEIGHT - 76, size: 8, font: bold, color: rgb(0.82, 0.84, 0.86) });
    const title = document.documentType === "quote" ? "COTIZACIÓN" : "NOTA DE ENTREGA";
    page.drawText(title, { x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(title, 16), y: PAGE_HEIGHT - 55, size: 16, font: bold, color: rgb(1, 1, 1) });
    page.drawText(document.documentNumber, { x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(document.documentNumber, 9), y: PAGE_HEIGHT - 76, size: 9, font: regular, color: rgb(0.78, 0.8, 0.82) });
    y = PAGE_HEIGHT - 142;
  };

  const drawTableHeader = () => {
    page.drawRectangle({ x: MARGIN, y: y - 18, width: PAGE_WIDTH - MARGIN * 2, height: 22, color: rgb(0.93, 0.95, 0.94) });
    page.drawText("PRODUCTO", { x: MARGIN + 8, y: y - 11, size: 7.5, font: bold });
    page.drawText("CANT.", { x: 330, y: y - 11, size: 7.5, font: bold });
    page.drawText("USD", { x: 385, y: y - 11, size: 7.5, font: bold });
    page.drawText("EQUIV. BS", { x: 455, y: y - 11, size: 7.5, font: bold });
    y -= 30;
  };

  drawHeader();
  drawLabel(page, regular, bold, "Cliente", document.customerName, MARGIN, y, 245);
  drawLabel(page, regular, bold, "Cédula / RIF", document.customerTaxId || "-", 320, y, 100);
  drawLabel(page, regular, bold, "Teléfono", document.customerPhone || "-", 445, y, 120);
  y -= 46;
  drawLabel(page, regular, bold, "Dirección", document.customerAddress || "-", MARGIN, y, 245);
  drawLabel(page, regular, bold, "Vendedor", document.sellerName, 320, y, 100);
  drawLabel(page, regular, bold, "Método", document.paymentMethod, 445, y, 120);
  y -= 52;
  drawLabel(page, regular, bold, "Emisión", date(document.issuedDate), MARGIN, y, 100);
  drawLabel(page, regular, bold, "Válida hasta", date(document.validUntil), 160, y, 100);
  drawLabel(page, regular, bold, "Tasa aplicada", `Bs. ${document.exchangeRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, 300, y, 130);
  drawLabel(page, regular, bold, "Moneda elegida", document.currency, 470, y, 90);
  y -= 54;
  drawTableHeader();

  for (const item of document.items) {
    if (y < 105) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      drawHeader();
      drawTableHeader();
    }
    const productLines = wrap(item.productName, regular, 8.5, 255).slice(0, 2);
    productLines.forEach((line, index) => page.drawText(line, { x: MARGIN + 8, y: y - index * 10, size: 8.5, font: regular }));
    if (item.sku) page.drawText(`SKU: ${safeText(item.sku)}`, { x: MARGIN + 8, y: y - productLines.length * 10 - 1, size: 6.5, font: regular, color: rgb(0.45, 0.47, 0.5) });
    page.drawText(String(item.quantity), { x: 338, y, size: 8.5, font: regular });
    page.drawText(money(item.lineTotalUsd, "USD"), { x: 385, y, size: 8.5, font: regular });
    page.drawText(money(item.lineTotalBs, "BS"), { x: 455, y, size: 8.5, font: regular });
    page.drawLine({ start: { x: MARGIN, y: y - 24 }, end: { x: PAGE_WIDTH - MARGIN, y: y - 24 }, thickness: 0.5, color: rgb(0.88, 0.89, 0.9) });
    y -= 34;
  }

  if (y < 165) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawHeader();
  }

  y -= 8;
  page.drawRectangle({ x: 322, y: y - 62, width: PAGE_WIDTH - MARGIN - 322, height: 72, color: rgb(0.04, 0.05, 0.06) });
  page.drawText("TOTAL USD", { x: 338, y: y - 13, size: 7.5, font: bold, color: rgb(0.7, 0.73, 0.75) });
  page.drawText(money(document.totalUsd, "USD"), { x: 338, y: y - 34, size: 16, font: bold, color: document.currency === "USD" ? rgb(0.2, 0.83, 0.52) : rgb(1, 1, 1) });
  page.drawText("TOTAL BS", { x: 455, y: y - 13, size: 7.5, font: bold, color: rgb(0.7, 0.73, 0.75) });
  page.drawText(money(document.totalBs, "BS"), { x: 455, y: y - 34, size: 12, font: bold, color: document.currency === "BS" ? rgb(0.2, 0.83, 0.52) : rgb(1, 1, 1) });

  page.drawText("CONDICIONES", { x: MARGIN, y: y - 5, size: 7.5, font: bold, color: rgb(0.42, 0.45, 0.48) });
  const condition = `Tasa válida desde ${date(document.issuedDate)} hasta el cierre del próximo día hábil: ${date(document.validUntil)}. Los días sábado y domingo no se contabilizan.`;
  wrap(condition, regular, 8, 250).slice(0, 4).forEach((line, index) => page.drawText(line, { x: MARGIN, y: y - 19 - index * 10, size: 8, font: regular }));
  if (document.notes) {
    y -= 82;
    page.drawText("OBSERVACIONES", { x: MARGIN, y, size: 7.5, font: bold, color: rgb(0.42, 0.45, 0.48) });
    wrap(document.notes, regular, 8, PAGE_WIDTH - MARGIN * 2).slice(0, 5).forEach((line, index) => page.drawText(line, { x: MARGIN, y: y - 14 - index * 10, size: 8, font: regular }));
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${document.documentNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
