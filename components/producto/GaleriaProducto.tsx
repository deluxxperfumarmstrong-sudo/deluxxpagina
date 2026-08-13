"use client";

import { useState } from "react";
import ImagenProducto from "@/components/ui/ImagenProducto";

// Desktop: sigue siendo la primera foto grande + la segunda al lado (como
// antes, sin interacción). Mobile: mosaico con TODAS las fotos cargadas —
// una grande arriba y el resto en una fila de miniaturas debajo. Tocar una
// miniatura la pasa a grande; la que estaba grande vuelve a su lugar en la
// fila (por índice original, no al final) — así funciona igual de bien con
// 2 fotos (simple ida y vuelta) que con más.
export default function GaleriaProducto({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [foto1, foto2] = imagenes;
  const [principal, setPrincipal] = useState(0);
  const indicesMiniaturas = imagenes.map((_, i) => i).filter((i) => i !== principal);

  return (
    <div>
      {/* Mobile: mosaico interactivo */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="relative aspect-[4/5]">
          <ImagenProducto
            publicId={imagenes[principal]}
            nombre={nombre}
            className="absolute inset-0"
            sizes="100vw"
          />
        </div>
        {imagenes.length > 1 && (
          <div className="grid grid-cols-3 gap-3">
            {indicesMiniaturas.map((i) => (
              <button
                key={`${imagenes[i]}-${i}`}
                type="button"
                onClick={() => setPrincipal(i)}
                aria-label={`Ver foto ${i + 1} de ${nombre} en grande`}
                // Feedback táctil (no hay :hover confiable en mobile) más un
                // anillo de foco para teclado/lector de pantalla — los únicos
                // signifiers que hacen falta acá: la miniatura ya se lee como
                // clickeable por ser una foto en una grilla junto a otras.
                className="relative aspect-square active:scale-95 transition-transform duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
              >
                <ImagenProducto
                  publicId={imagenes[i]}
                  nombre={nombre}
                  className="absolute inset-0"
                  sizes="33vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: dos columnas como antes.
          sizes="25vw" y no "50vw": la galería ya vive dentro de la columna
          izquierda de la ficha (md:grid-cols-2 en un max-w-6xl), así que
          cada una de estas dos fotos ocupa un cuarto del ancho de pantalla,
          no la mitad. Con 50vw el navegador le pedía a Cloudinary un archivo
          del doble de ancho del que se ve. */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        <div className="relative aspect-[3/4]">
          <ImagenProducto publicId={foto1} nombre={nombre} className="absolute inset-0" sizes="25vw" />
        </div>
        <div className="relative aspect-[3/4]">
          <ImagenProducto publicId={foto2} nombre={nombre} className="absolute inset-0" sizes="25vw" />
        </div>
      </div>
    </div>
  );
}
