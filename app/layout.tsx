import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { SITE } from "@/lib/config";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.nombre} — Perfumería árabe, nicho y diseñador`,
    template: `%s — ${SITE.nombre}`,
  },
  description: SITE.descripcion,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: SITE.nombre,
    description: SITE.descripcion,
    siteName: SITE.nombre,
    locale: "es_AR",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 800, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.nombre,
    description: SITE.descripcion,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
