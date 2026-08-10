import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoriasActivas, getProductos } from "@/lib/data";
import FiltrosCatalogo from "@/components/catalogo/FiltrosCatalogo";
import GrillaProductos from "@/components/catalogo/GrillaProductos";
import Paginacion from "@/components/catalogo/Paginacion";
import CintaBeneficios from "@/components/home/CintaBeneficios";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Perfumería árabe, de nicho, de diseñador y kits.",
};

const POR_PAGINA = 24;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const categoriaSlug = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const tipo = sp.tipo === "ENCARGO" || sp.tipo === "STOCK" ? sp.tipo : undefined;
  const ml = typeof sp.ml === "string" && sp.ml ? Number(sp.ml) : undefined;
  const orden =
    sp.orden === "precio-asc" || sp.orden === "precio-desc" ? sp.orden : "reciente";
  const pagina = typeof sp.pagina === "string" ? Math.max(1, Number(sp.pagina) || 1) : 1;

  const [categorias, { productos, total }] = await Promise.all([
    getCategoriasActivas(),
    getProductos({ categoriaSlug, tipo, ml, orden, pagina, porPagina: POR_PAGINA }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 md:px-12 pt-12 md:pt-16">
        <h1 className="font-display text-3xl md:text-4xl text-on-background mb-2">Catálogo</h1>
        <p className="text-on-surface-muted mb-4">{total} productos</p>

        <Suspense>
          <FiltrosCatalogo categorias={categorias} />
        </Suspense>
      </div>

      {/* relative: le da a CintaBeneficios (sticky) el recorrido de la
          grilla completa — se despega sola al terminar, no persiste hasta
          el footer (mismo patrón que la home). */}
      <div className="relative">
        <CintaBeneficios />
        {/* py-6/py-7 = 48px/64px con la escala custom del proyecto. `py-8` son
            96px y `py-10` solo 40px (el paso 10 no está overrideado), o sea
            que la progresión responsive salía al revés. */}
        <div className="mx-auto max-w-7xl px-4 md:px-12 py-6 md:py-7">
          <GrillaProductos productos={productos} />

          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            basePath="/catalogo"
            searchParams={{
              categoria: categoriaSlug,
              tipo,
              ml: ml ? String(ml) : undefined,
              orden: orden !== "reciente" ? orden : undefined,
            }}
          />
        </div>
      </div>
    </>
  );
}
