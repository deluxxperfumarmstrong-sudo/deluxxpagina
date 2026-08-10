"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCarrito, totalesCarrito } from "@/lib/store/carrito";
import IconoCarrito from "@/components/icons/IconoCarrito";

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
      aria-label="Carrito"
      className="relative flex items-center justify-center min-w-11 min-h-11 -mr-1 text-on-background hover:text-accent transition-colors"
    >
      <IconoCarrito className="w-5 h-5" />
      {montado && cantidadItems > 0 && (
        <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-accent text-on-accent text-xs font-bold">
          {cantidadItems}
        </span>
      )}
    </Link>
  );
}
