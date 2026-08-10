"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
// El .env.example trae un placeholder ("dxxxxxx") — mientras no se
// reemplace por una cuenta real, se sirve un bloque tonal en vez de romper
// el layout. Ver docs/BLOQUEOS.md.
const CLOUDINARY_CONFIGURADO = !!CLOUD_NAME && CLOUD_NAME !== "dxxxxxx";

function Placeholder({ nombre }: { nombre: string }) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || "D";
  return (
    <div className="w-full h-full bg-surface-metallic/40 border border-border-subtle flex items-center justify-center">
      <span className="font-display text-4xl text-on-surface-muted">{inicial}</span>
    </div>
  );
}

export default function ImagenProducto({
  publicId,
  nombre,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: {
  publicId: string | undefined;
  nombre: string;
  className?: string;
  sizes?: string;
}) {
  const [error, setError] = useState(false);

  if (!CLOUDINARY_CONFIGURADO || !publicId || error) {
    return (
      <div className={className}>
        <Placeholder nombre={nombre} />
      </div>
    );
  }

  return (
    <div className={className}>
      <CldImage
        src={publicId}
        alt={nombre}
        fill
        sizes={sizes}
        // "auto:best" en vez del "auto" por defecto — el cliente pidió la
        // mejor calidad posible para las fotos de producto (a diferencia
        // de banners/logo, acá el detalle importa para la decisión de
        // compra). Sigue siendo un modo "auto" de Cloudinary, no q_100: deja
        // que Cloudinary elija el archivo más liviano dentro del rango de
        // máxima fidelidad visual, en vez de mandar siempre el peso máximo.
        quality="auto:best"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
