"use client";

import dynamic from "next/dynamic";

// Carga diferida sin SSR: three.js/WebGL no tiene nada que hacer en el
// servidor y agregarlo al bundle inicial pesaría de más. Vive en un archivo
// aparte porque `dynamic(..., { ssr: false })` solo puede llamarse desde un
// Client Component — Hero.tsx sigue siendo Server Component.
const Frasco3D = dynamic(() => import("./Frasco3D"), { ssr: false });

export default function Frasco3DOverlay() {
  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none
        inset-x-4 top-[calc(var(--header-height,72px)-6px)] h-[42%]
        md:inset-x-auto md:right-[6%] md:w-[34%] md:h-[90%]"
    >
      {/* Mobile: frasco arriba, centrado y angosto, con el texto acomodado
          debajo (ver Hero.tsx). Desktop: columna a la derecha, centrada
          verticalmente. El margen de cámara en Frasco3D.tsx ya garantiza
          que no se corte con la tapa en ninguno de los dos casos.
          touch-none + pointer-events-auto en los dos niveles: sin esto el
          scroll táctil de la página puede ganarle al drag del OrbitControls
          en mobile, dejando el 3D como si no respondiera al tacto. */}
      <div className="w-[92%] h-full md:w-full pointer-events-auto touch-none">
        <Frasco3D />
      </div>
    </div>
  );
}
