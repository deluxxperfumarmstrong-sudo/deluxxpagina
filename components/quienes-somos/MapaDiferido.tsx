"use client";

import { useState } from "react";

// El embed de Google Maps es, visualmente, el elemento más ajeno a design.md
// de todo el sitio: chrome blanco y azul, esquinas redondeadas y un segundo
// color de acento, justo lo que el "Don't" del sistema prohíbe. Y cuesta caro
// para lo que aporta — arrastra ~1 MB de JS de terceros y cookies en una
// página donde nadie viene a buscar cómo llegar (no hay local a la calle: se
// opera desde Armstrong).
//
// En vez de elegir entre "mapa feo" o "sin mapa", se difiere: en reposo es un
// panel de la paleta del sitio con el dato que la gente realmente busca (dónde
// estamos), y el mapa real carga con un click, para quien lo quiera. La página
// queda en marca, no paga el costo de terceros salvo que se lo pidan, y la
// función sigue estando.
export default function MapaDiferido({
  ciudad,
  provincia,
  consulta,
}: {
  ciudad: string;
  provincia: string;
  consulta: string;
}) {
  const [cargado, setCargado] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&output=embed`;

  return (
    // Sin overflow-hidden y sin radio: las esquinas rectas ya son el default de
    // design.md, y así el anillo de foco del botón no queda recortado.
    <div className="border border-border-subtle bg-surface-raised aspect-[16/9] md:aspect-[21/9]">
      {cargado ? (
        <iframe
          src={src}
          title={`Ubicación de Deluxx Perfum en ${ciudad}, ${provincia}`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        // Todo el panel es el área clickeable, no un botón chico adentro
        // (Fitts): el destino más grande posible para la única acción que hay.
        <button
          type="button"
          onClick={() => setCargado(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center
            transition-colors hover:bg-surface
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          <span className="font-display text-3xl md:text-5xl text-on-background leading-none">
            {ciudad}
          </span>
          <span className="text-xs uppercase tracking-widest text-on-surface-muted">
            {provincia}, Argentina
          </span>
          <span
            className="mt-4 border border-accent-text text-accent-text font-[var(--font-body)]
              font-bold text-xs uppercase tracking-[0.08em] px-[32px] py-[16px]"
          >
            Ver el mapa
          </span>
        </button>
      )}
    </div>
  );
}
