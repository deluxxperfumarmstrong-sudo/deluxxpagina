"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCarrito, totalesCarrito } from "@/lib/store/carrito";

export default function CarritoBadge() {
  const items = useCarrito((s) => s.items);
  const [montado, setMontado] = useState(false);

  // Evita hydration mismatch: el conteo persistido en localStorage solo se
  // conoce en el cliente.
  useEffect(() => setMontado(true), []);

  const { cantidadItems } = totalesCarrito(items);

  return (
    <Link
      href="/carrito"
      className="relative font-body-emphasis text-sm uppercase tracking-wide text-on-background hover:text-accent transition-colors"
    >
      Carrito
      {montado && cantidadItems > 0 && (
        <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-accent text-on-accent text-xs font-bold">
          {cantidadItems}
        </span>
      )}
    </Link>
  );
}
