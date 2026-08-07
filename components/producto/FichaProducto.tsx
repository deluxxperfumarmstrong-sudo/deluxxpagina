"use client";

import { useMemo, useState } from "react";
import type { Producto } from "@/lib/types";
import { precioPorMl, calcularSena } from "@/lib/precio";
import { useCarrito } from "@/lib/store/carrito";
import MlSelector from "./MlSelector";
import PrecioBloque from "./PrecioBloque";
import { BadgeTipo, BadgeMuestra } from "./Badges";

export default function FichaProducto({ producto }: { producto: Producto }) {
  const mililitrosOrdenados = useMemo(
    () => [...producto.mililitros].sort((a, b) => a - b),
    [producto.mililitros]
  );
  const [ml, setMl] = useState(mililitrosOrdenados[0]);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const agregarItem = useCarrito((s) => s.agregarItem);

  const precio = precioPorMl(producto, ml);
  const sena = calcularSena(producto, ml);

  function handleAgregar() {
    agregarItem(
      {
        productoSlug: producto.slug,
        nombre: producto.nombre,
        categoriaNombre: producto.categoria.nombre,
        tipo: producto.tipo,
        ml,
        precioUnitario: precio,
        tieneSena: sena != null,
        senaUnitaria: sena ?? 0,
      },
      cantidad
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BadgeTipo tipo={producto.tipo} />
        {producto.tieneMuestra && <BadgeMuestra />}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">
          {producto.categoria.nombre}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-on-background leading-none">
          {producto.nombre}
        </h1>
      </div>

      {producto.notas && (
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">
            Notas olfativas
          </p>
          <p className="text-on-surface">{producto.notas}</p>
        </div>
      )}

      <MlSelector opciones={mililitrosOrdenados} seleccionado={ml} onSeleccionar={setMl} />

      <PrecioBloque precio={precio} sena={sena} />

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-border">
          <button
            type="button"
            aria-label="Restar cantidad"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="w-10 h-12 text-on-surface hover:text-accent"
          >
            −
          </button>
          <span className="w-10 text-center text-on-surface" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            aria-label="Sumar cantidad"
            onClick={() => setCantidad((c) => c + 1)}
            className="w-10 h-12 text-on-surface hover:text-accent"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAgregar}
          className={`flex-1 font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-8 py-4 transition-colors ${
            agregado
              ? "bg-success text-on-primary"
              : "bg-primary text-on-primary hover:bg-[#E8E8E8]"
          }`}
        >
          {agregado ? "Agregado ✓" : "Agregar al carrito"}
        </button>
      </div>

      {producto.descripcion && (
        <p className="text-on-surface-muted leading-relaxed">{producto.descripcion}</p>
      )}
    </div>
  );
}
