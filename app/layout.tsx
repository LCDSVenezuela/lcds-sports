import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LCDS Sports | La Casa del Softball",
    template: "%s | LCDS Sports",
  },
  description: "Pelotas de softball, equipamiento y artículos deportivos desde Portuguesa con envíos a toda Venezuela.",
  keywords: ["softball", "pelotas de softball", "Tamanaco", "LCDS Sports", "deportes Venezuela"],
  openGraph: {
    title: "LCDS Sports | La Casa del Softball",
    description: "Pelotas, equipamiento y artículos deportivos con envíos a toda Venezuela.",
    type: "website",
    locale: "es_VE",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
