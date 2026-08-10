import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { SITE } from "@/lib/config";
import { getCategoriasActivas } from "@/lib/data";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Las categorías del menú salen de la base, no de CATEGORIAS_SEED: el seed
  // incluye categorías que pueden estar desactivadas o sin productos activos
  // (ej. "Kits"), y esas no existen para el sitio público — enlazarlas desde
  // el nav era mandar al cliente a una categoría vacía.
  const categorias = await getCategoriasActivas();

  return (
    <html
      lang="es"
      className={`${anton.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <SiteChrome categorias={categorias.map((c) => ({ nombre: c.nombre, slug: c.slug }))}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
