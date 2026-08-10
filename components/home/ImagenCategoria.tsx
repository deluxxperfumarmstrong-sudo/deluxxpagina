"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
// El .env.example trae un placeholder ("dxxxxxx") — mientras no se
// reemplace por una cuenta real, no se intenta pedir la imagen a
// Cloudinary (mismo guard que ImagenProducto).
const CLOUDINARY_CONFIGURADO = !!CLOUD_NAME && CLOUD_NAME !== "dxxxxxx";

// Banners subidos como deluxx/categorias/{slug} (ver docs/BLOQUEOS.md).
// Mismo patrón que ImagenProducto: sin el guard de error, una imagen
// faltante en Cloudinary deja el ícono de "imagen rota" encima del fondo
// de respaldo en vez de dejar ver ese fondo solo.
export default function ImagenCategoria({ slug, nombre }: { slug: string; nombre: string }) {
  const [error, setError] = useState(false);

  if (!CLOUDINARY_CONFIGURADO || error) return null;

  return (
    <CldImage
      src={`deluxx/categorias/${slug}`}
      alt={nombre}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setError(true)}
    />
  );
}
