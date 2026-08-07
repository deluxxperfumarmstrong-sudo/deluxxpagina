"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCarrito } from "@/lib/store/carrito";
import ItemCarritoFila from "@/components/carrito/ItemCarritoFila";
import ResumenCarrito from "@/components/carrito/ResumenCarrito";

export default function CarritoPage() {
  const items = useCarrito((s) => s.items);
  const [montado, setMontado] = useState(false);

  // El carrito persiste en localStorage; recién se conoce en el cliente.
  useEffect(() => setMontado(true), []);

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-12 py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl text-on-background mb-8">Carrito</h1>

      {!montado ? null : items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border-subtle">
          <p className="text-on-surface-muted mb-4">Tu carrito está vacío.</p>
          <Link
            href="/catalogo"
            className="inline-block border border-accent text-accent font-[var(--font-body)] font-bold text-sm uppercase tracking-[0.08em] px-[32px] py-[16px] hover:bg-accent hover:text-on-accent transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10">
          <div>
            {items.map((item) => (
              <ItemCarritoFila key={`${item.productoSlug}-${item.ml}`} item={item} />
            ))}
          </div>
          <ResumenCarrito items={items} />
        </div>
      )}
    </div>
  );
}
