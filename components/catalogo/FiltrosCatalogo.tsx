"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MILILITROS_VALIDOS } from "@/lib/config";
import type { Categoria } from "@/lib/types";

const ETIQUETA_GENERO: Record<string, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  UNISEX: "Unisex",
};

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

  // Búsqueda por nombre — se integra al mismo sistema de filtros (misma
  // URL, mismo `actualizar`), no es una página ni un estado aparte. Con
  // debounce en vez de por cada tecla: sin esto, cada letra tipeada
  // dispara una navegación (router.push) y el catálogo entero se vuelve a
  // pedir al servidor letra por letra.
  const [busqueda, setBusqueda] = useState(searchParams.get("q") ?? "");
  useEffect(() => {
    setBusqueda(searchParams.get("q") ?? "");
  }, [searchParams]);
  useEffect(() => {
    const actual = searchParams.get("q") ?? "";
    if (busqueda === actual) return;
    const id = setTimeout(() => actualizar("q", busqueda), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  // `orden` va en la misma lista que el resto: su placeholder es
  // `disabled hidden`, así que si no se puede borrar por acá el cliente queda
  // sin ninguna forma de volver al orden por defecto.
  const CLAVES_FILTRO = ["categoria", "tipo", "ml", "genero", "relevancia", "orden", "q"];

  function limpiarTodo() {
    const params = new URLSearchParams(searchParams.toString());
    for (const clave of CLAVES_FILTRO) params.delete(clave);
    params.delete("pagina");
    setBusqueda("");
    router.push(`${pathname}?${params.toString()}`);
  }

  const categoriaSlug = searchParams.get("categoria") ?? "";
  const tipoActivo = searchParams.get("tipo") ?? "";
  const mlActivo = searchParams.get("ml") ?? "";
  const generoActivo = searchParams.get("genero") ?? "";
  const ordenActivo = searchParams.get("orden") ?? "";

  const chips: { clave: string; etiqueta: string }[] = [];
  if (categoriaSlug) {
    const cat = categorias.find((c) => c.slug === categoriaSlug);
    chips.push({ clave: "categoria", etiqueta: cat?.nombre ?? categoriaSlug });
  }
  if (tipoActivo) {
    chips.push({
      clave: "tipo",
      etiqueta: tipoActivo === "ENCARGO" ? "Por encargo" : "En stock",
    });
  }
  if (mlActivo) {
    chips.push({ clave: "ml", etiqueta: `${mlActivo} ml` });
  }
  if (generoActivo) {
    chips.push({ clave: "genero", etiqueta: ETIQUETA_GENERO[generoActivo] ?? generoActivo });
  }
  if (ordenActivo) {
    chips.push({
      clave: "orden",
      etiqueta:
        ordenActivo === "precio-asc"
          ? "Precio ↑"
          : ordenActivo === "precio-desc"
            ? "Precio ↓"
            : "Más relevantes",
    });
  }
  if (busqueda) {
    chips.push({ clave: "q", etiqueta: `"${busqueda}"` });
  }

  // text-base en móvil (NO text-xs): por debajo de 16px, Safari iOS hace zoom
  // automático al enfocar el select — es el fix del commit e9aeae5, no tocar.
  // min-h-11 son 44px reales (el paso 11 no está overrideado); pr arbitrario
  // porque `pr-7` serían 64px con la escala custom de globals.css.
  const selectClassName =
    "w-full appearance-none bg-surface border border-border text-on-surface text-base sm:text-sm min-h-11 px-3 pr-[28px] py-2.5 rounded-sm truncate focus-visible:outline-accent focus-visible:border-accent hover:border-accent-text transition-colors";

  function Chevron() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-accent"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  return (
    <div className="py-4 border-b border-border-subtle mb-6">
      <div className="relative mb-2.5">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar producto por nombre"
          // Mismo criterio de text-base en mobile que el resto de los
          // controles del filtro (evita el zoom automático de iOS Safari).
          className="w-full bg-surface border border-border text-on-surface text-base sm:text-sm min-h-11 px-3 rounded-sm focus-visible:outline-accent focus-visible:border-accent hover:border-accent-text transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 items-center">
        {mostrarCategoria && (
          <div className="relative sm:w-auto">
            <select
              aria-label="Filtrar por categoría"
              className={selectClassName}
              value={searchParams.get("categoria") ?? ""}
              onChange={(e) => actualizar("categoria", e.target.value)}
            >
              <option value="" disabled hidden>
                Categoría
              </option>
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        )}

        <div className="relative sm:w-auto">
          <select
            aria-label="Filtrar por tipo"
            className={selectClassName}
            value={searchParams.get("tipo") ?? ""}
            onChange={(e) => actualizar("tipo", e.target.value)}
          >
            <option value="" disabled hidden>
              Tipo
            </option>
            <option value="ENCARGO">Por encargo</option>
            <option value="STOCK">En stock</option>
          </select>
          <Chevron />
        </div>

        <div className="relative sm:w-auto">
          <select
            aria-label="Filtrar por tamaño en mililitros"
            className={selectClassName}
            value={searchParams.get("ml") ?? ""}
            onChange={(e) => actualizar("ml", e.target.value)}
          >
            <option value="" disabled hidden>
              Tamaño
            </option>
            {MILILITROS_VALIDOS.map((ml) => (
              <option key={ml} value={ml}>
                {ml} ml
              </option>
            ))}
          </select>
          <Chevron />
        </div>

        <div className="relative sm:w-auto">
          <select
            aria-label="Filtrar por género"
            className={selectClassName}
            value={generoActivo}
            onChange={(e) => actualizar("genero", e.target.value)}
          >
            <option value="" disabled hidden>
              Género
            </option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="UNISEX">Unisex</option>
          </select>
          <Chevron />
        </div>

        <div className="relative sm:w-auto">
          <select
            aria-label="Ordenar por"
            className={selectClassName}
            value={ordenActivo}
            onChange={(e) => actualizar("orden", e.target.value)}
          >
            <option value="" disabled hidden>
              Ordenar
            </option>
            <option value="relevancia">Más relevantes primero</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
          <Chevron />
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {chips.map((chip) => (
            <button
              key={chip.clave}
              type="button"
              onClick={() => {
                if (chip.clave === "q") setBusqueda("");
                actualizar(chip.clave, "");
              }}
              aria-label={`Quitar filtro ${chip.etiqueta}`}
              className="flex items-center gap-1.5 h-[28px] pl-3 pr-2.5 text-xs rounded-full border border-accent bg-surface-raised text-on-surface hover:bg-surface transition-colors"
            >
              {chip.etiqueta}
              <span aria-hidden="true" className="text-accent font-bold">
                ✕
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={limpiarTodo}
            className="h-[28px] flex items-center text-xs text-on-surface-muted hover:text-accent underline transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
