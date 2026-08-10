"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { useCarrito, totalesCarrito } from "@/lib/store/carrito";
import { useCarritoUI } from "@/lib/store/carritoUI";
import { formatoPrecio } from "@/lib/formato";
import ImagenProducto from "@/components/ui/ImagenProducto";

// Vista previa del carrito: se abre sola cada vez que se agrega un
// producto (ver ProductCard/FichaProducto), pero el pase a /carrito lo
// decide el cliente — nunca navegamos automáticamente.
export default function DrawerCarrito() {
  const items = useCarrito((s) => s.items);
  const abierto = useCarritoUI((s) => s.abierto);
  const cerrar = useCarritoUI((s) => s.cerrar);
  const { subtotal, cantidadItems } = totalesCarrito(items);
  const tituloId = useId();
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Foco al botón de cerrar apenas se abre — sin esto, un usuario de
    // teclado/lector de pantalla sigue con el foco en el botón "Agregar"
    // detrás del overlay, que queda inalcanzable con Tab.
    cerrarRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") cerrar();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
      <button
        type="button"
        aria-label="Cerrar vista previa del carrito"
        onClick={cerrar}
        className="absolute inset-0 bg-black/60"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 id={tituloId} className="font-display text-xl text-on-surface">
            Agregado al carrito {cantidadItems > 0 && `(${cantidadItems})`}
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            aria-label="Cerrar"
            onClick={cerrar}
            className="flex items-center justify-center min-w-11 min-h-11 text-on-surface-muted hover:text-accent transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-on-surface-muted text-sm">Tu carrito está vacío.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={`${item.productoSlug}-${item.ml}`}
                  className="flex items-start gap-3 pb-4 border-b border-border-subtle last:border-b-0"
                >
                  <div className="relative shrink-0 w-16 h-16 overflow-hidden rounded-sm">
                    <ImagenProducto
                      publicId={item.imagen}
                      nombre={item.nombre}
                      className="absolute inset-0"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{item.nombre}</p>
                      <p className="text-xs text-on-surface-muted mt-0.5">
                        {item.ml}ml · Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-on-surface">
                      {formatoPrecio(item.precioUnitario * item.cantidad)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between text-on-surface font-display text-lg">
            <span>Subtotal</span>
            <span>{formatoPrecio(subtotal)}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={cerrar}
              className="sm:flex-1 border border-border text-on-surface font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[24px] py-[14px] hover:border-accent hover:text-accent transition-colors"
            >
              Seguir comprando
            </button>
            <Link
              href="/carrito"
              onClick={cerrar}
              className="sm:flex-1 text-center bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[24px] py-[14px] hover:bg-[#E8E8E8] transition-colors"
            >
              Ver carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
