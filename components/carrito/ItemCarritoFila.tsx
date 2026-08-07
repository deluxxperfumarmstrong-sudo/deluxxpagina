"use client";

import Link from "next/link";
import type { ItemCarrito } from "@/lib/store/carrito";
import { useCarrito } from "@/lib/store/carrito";
import { formatoPrecio } from "@/lib/formato";

export default function ItemCarritoFila({ item }: { item: ItemCarrito }) {
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad);
  const quitarItem = useCarrito((s) => s.quitarItem);
  const subtotal = item.precioUnitario * item.cantidad;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-5 border-b border-border-subtle">
      <div className="flex-1 min-w-0">
        <Link
          href={`/producto/${item.productoSlug}`}
          className="font-display text-lg text-on-surface hover:text-accent transition-colors"
        >
          {item.nombre}
        </Link>
        <p className="text-xs text-on-surface-muted mt-1">
          {item.categoriaNombre} · {item.ml}ml ·{" "}
          {item.tipo === "ENCARGO" ? "Por encargo" : "En stock"}
        </p>
        {item.tieneSena && (
          <p className="text-xs text-accent mt-1">
            Seña: {formatoPrecio(item.senaUnitaria * item.cantidad)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-4">
        <div className="flex items-center border border-border">
          <button
            type="button"
            aria-label="Restar cantidad"
            onClick={() => actualizarCantidad(item.productoSlug, item.ml, item.cantidad - 1)}
            className="w-8 h-10 text-on-surface hover:text-accent"
          >
            −
          </button>
          <span className="w-8 text-center text-sm text-on-surface">{item.cantidad}</span>
          <button
            type="button"
            aria-label="Sumar cantidad"
            onClick={() => actualizarCantidad(item.productoSlug, item.ml, item.cantidad + 1)}
            className="w-8 h-10 text-on-surface hover:text-accent"
          >
            +
          </button>
        </div>

        <p className="sm:w-28 text-right font-semibold text-on-surface">
          {formatoPrecio(subtotal)}
        </p>

        <button
          type="button"
          aria-label={`Quitar ${item.nombre} del carrito`}
          onClick={() => quitarItem(item.productoSlug, item.ml)}
          className="text-on-surface-muted hover:text-error text-sm font-semibold transition-colors"
        >
          Quitar
        </button>
      </div>
    </div>
  );
}
