"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
// El .env.example trae un placeholder ("dxxxxxx") — mientras no se
// reemplace por una cuenta real, no se intenta pedir la imagen a
// Cloudinary (mismo guard que ImagenProducto).
const CLOUDINARY_CONFIGURADO = !!CLOUD_NAME && CLOUD_NAME !== "dxxxxxx";

// `imagenUrl` es el public_id que se carga al crear/editar la categoría
// desde el admin (ver CategoriaForm.tsx / ImagenCategoriaSubidor.tsx), pese
// al nombre del campo no es una URL completa (ver schema.prisma). Las 4
// categorías sembradas antes de que ese campo existiera no lo tienen
// cargado, así que se cae al banner subido a mano como
// deluxx/categorias/{slug} (ver docs/BLOQUEOS.md) para no perder esas
// imágenes. Mismo patrón que ImagenProducto: sin el guard de error, una
// imagen faltante en Cloudinary deja el ícono de "imagen rota" encima del
// fondo de respaldo en vez de dejar ver ese fondo solo.
export default function ImagenCategoria({
  slug,
  nombre,
  imagenUrl,
}: {
  slug: string;
  nombre: string;
  imagenUrl: string | null;
}) {
  const [error, setError] = useState(false);

  if (!CLOUDINARY_CONFIGURADO || error) return null;

  return (
    <CldImage
      src={imagenUrl || `deluxx/categorias/${slug}`}
      alt={nombre}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setError(true)}
    />
  );
}
