import type { CatalogSnapshot } from "@/lib/catalog";

export const fallbackCatalog: CatalogSnapshot = {
  rateBcv: 250,
  settings: {
    announcementEnabled: true,
    announcementText: "Envío GRATIS por Zoom y Tealca a toda Venezuela",
    announcementMessages: [
      "Envío GRATIS por Zoom y Tealca a toda Venezuela",
      "Ventas al mayor para equipos, academias y comercios",
      "Atención directa por WhatsApp",
    ],
    announcementLink: null,
    whatsappPhone: "584225329551",
    locationText: "Portuguesa, Venezuela",
    shippingText: "Envío gratis por Zoom y Tealca a toda Venezuela",
    wholesaleTitle: "Precios especiales para equipos, academias y comercios",
    wholesaleText: "Consulta condiciones por cantidad y recibe atención personalizada.",
    businessHours: "",
    instagramUrl: null,
    tiktokUrl: null,
    facebookUrl: null,
  },
  banners: [],
  paymentMethods: [
    { id: 1, name: "Zelle", detail: "Precio en divisas" },
    { id: 2, name: "USDT", detail: "Precio en divisas" },
    { id: 3, name: "Divisas", detail: "Efectivo en USD" },
    { id: 4, name: "Depósito bancario", detail: "Precio en divisas" },
    { id: 5, name: "Pago móvil", detail: "Monto en Bs. según tasa vigente" },
    { id: 6, name: "Transferencia Bs.", detail: "Monto en Bs. según tasa vigente" },
  ],
  products: [],
};
