"use client";

import { useState } from "react";
import Image from "next/image";

// Mismo patrón que ImagenProducto: sin esto, un /categorias/{slug}.png
// faltante deja el ícono de "imagen rota" de Next encima del fondo de
// respaldo en vez de dejar ver ese fondo solo.
export default function ImagenCategoria({ slug, nombre }: { slug: string; nombre: string }) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <Image
      src={`/categorias/${slug}.png`}
      alt={nombre}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setError(true)}
    />
  );
}
