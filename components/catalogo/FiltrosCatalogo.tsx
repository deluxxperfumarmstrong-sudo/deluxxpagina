"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MILILITROS_VALIDOS } from "@/lib/config";
import type { Categoria } from "@/lib/types";

export default function FiltrosCatalogo({
  categorias,
  mostrarCategoria = true,
}: {
  categorias: Categoria[];
  mostrarCategoria?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function actualizar(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center py-6 border-b border-border-subtle mb-8">
      {mostrarCategoria && (
        <select
          aria-label="Filtrar por categoría"
          className="bg-surface border border-border text-on-surface text-sm px-4 py-3 rounded-none focus-visible:outline-accent"
          value={searchParams.get("categoria") ?? ""}
          onChange={(e) => actualizar("categoria", e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}

      <select
        aria-label="Filtrar por tipo"
        className="bg-surface border border-border text-on-surface text-sm px-4 py-3 rounded-none focus-visible:outline-accent"
        value={searchParams.get("tipo") ?? ""}
        onChange={(e) => actualizar("tipo", e.target.value)}
      >
        <option value="">Encargo y stock</option>
        <option value="ENCARGO">Por encargo</option>
        <option value="STOCK">En stock</option>
      </select>

      <select
        aria-label="Filtrar por tamaño en mililitros"
        className="bg-surface border border-border text-on-surface text-sm px-4 py-3 rounded-none focus-visible:outline-accent"
        value={searchParams.get("ml") ?? ""}
        onChange={(e) => actualizar("ml", e.target.value)}
      >
        <option value="">Cualquier tamaño</option>
        {MILILITROS_VALIDOS.map((ml) => (
          <option key={ml} value={ml}>
            {ml} ml
          </option>
        ))}
      </select>

      <select
        aria-label="Ordenar por"
        className="bg-surface border border-border text-on-surface text-sm px-4 py-3 rounded-none focus-visible:outline-accent"
        value={searchParams.get("orden") ?? ""}
        onChange={(e) => actualizar("orden", e.target.value)}
      >
        <option value="">Más recientes</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
      </select>
    </div>
  );
}
