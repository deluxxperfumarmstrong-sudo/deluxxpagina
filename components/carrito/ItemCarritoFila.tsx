"use client";

import Link from "next/link";
import type { ItemCarrito } from "@/lib/store/carrito";
import { useCarrito } from "@/lib/store/carrito";
import { formatoPrecio } from "@/lib/formato";
import ImagenProducto from "@/components/ui/ImagenProducto";

export default function ItemCarritoFila({ item }: { item: ItemCarrito }) {
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad);
  const quitarItem = useCarrito((s) => s.quitarItem);
  const subtotal = item.precioUnitario * item.cantidad;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-5 border-b border-border-subtle">
      <Link
        href={`/producto/${item.productoSlug}`}
        className="relative shrink-0 w-20 h-20 overflow-hidden rounded-sm"
      >
        <ImagenProducto
          publicId={item.imagen}
          nombre={item.nombre}
          className="absolute inset-0"
          sizes="80px"
        />
      </Link>
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
          <p className="text-xs text-accent-text mt-1">
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
            className="w-11 h-11 text-on-surface hover:text-accent"
          >
            −
          </button>
          <span className="w-8 text-center text-sm text-on-surface" aria-live="polite">{item.cantidad}</span>
          <button
            type="button"
            aria-label="Sumar cantidad"
            disabled={item.stockMaximo != null && item.cantidad >= item.stockMaximo}
            onClick={() => actualizarCantidad(item.productoSlug, item.ml, item.cantidad + 1)}
            className="w-11 h-11 text-on-surface hover:text-accent disabled:opacity-30 disabled:hover:text-on-surface"
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
          className="flex items-center min-h-11 -my-2 px-1 -mr-1 text-on-surface-muted hover:text-error text-sm font-semibold transition-colors"
        >
          Quitar
        </button>
      </div>
    </div>
  );
}
