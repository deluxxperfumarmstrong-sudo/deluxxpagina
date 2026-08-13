import type { MetadataRoute } from "next";
import { getCategoriasActivas, getProductos } from "@/lib/data";
import { SITE } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, { productos }] = await Promise.all([
    getCategoriasActivas(),
    getProductos({ porPagina: 1000 }),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/muestras`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/envios-y-pagos`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/carrito`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE.url}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const paginasCategoria: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE.url}/categoria/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const paginasProducto: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITE.url}/producto/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...estaticas, ...paginasCategoria, ...paginasProducto];
}
