import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategoriaBySlug, getCategoriasActivas, getProductos } from "@/lib/data";
import FiltrosCatalogo from "@/components/catalogo/FiltrosCatalogo";
import GrillaProductos from "@/components/catalogo/GrillaProductos";
import Paginacion from "@/components/catalogo/Paginacion";

const POR_PAGINA = 24;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await getCategoriaBySlug(slug);
  if (!categoria) return {};
  return {
    title: categoria.nombre,
    description: `Productos de la categoría ${categoria.nombre} en Deluxx Perfum.`,
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const categoria = await getCategoriaBySlug(slug);
  if (!categoria || !categoria.activa) notFound();

  const tipo = sp.tipo === "ENCARGO" || sp.tipo === "STOCK" ? sp.tipo : undefined;
  const ml = typeof sp.ml === "string" && sp.ml ? Number(sp.ml) : undefined;
  const genero =
    sp.genero === "MASCULINO" || sp.genero === "FEMENINO" || sp.genero === "UNISEX"
      ? sp.genero
      : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const orden =
    sp.orden === "precio-asc" || sp.orden === "precio-desc" || sp.orden === "relevancia"
      ? sp.orden
      : "reciente";
  const pagina = typeof sp.pagina === "string" ? Math.max(1, Number(sp.pagina) || 1) : 1;

  const [categoriasActivas, { productos, total }] = await Promise.all([
    getCategoriasActivas(),
    getProductos({
      categoriaSlug: slug,
      tipo,
      ml,
      genero,
      q,
      orden,
      pagina,
      porPagina: POR_PAGINA,
    }),
  ]);

  // Regla 6: si la categoría no tiene productos activos, sigue existiendo en
  // la base pero no se muestra en la navegación — acá se llega solo por URL
  // directa, y mostramos el estado vacío en vez de un 404.
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-12 py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl text-on-background mb-2">
        {categoria.nombre}
      </h1>
      <p className="text-on-surface-muted mb-6">{total} productos</p>

      <Suspense>
        <FiltrosCatalogo categorias={categoriasActivas} mostrarCategoria={false} />
      </Suspense>

      <GrillaProductos productos={productos} />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        basePath={`/categoria/${slug}`}
        searchParams={{
          tipo,
          ml: ml ? String(ml) : undefined,
          genero,
          q,
          orden: orden !== "reciente" ? orden : undefined,
        }}
      />
    </div>
  );
}
