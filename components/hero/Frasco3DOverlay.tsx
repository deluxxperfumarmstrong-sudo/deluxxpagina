"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Carga diferida sin SSR: three.js/WebGL no tiene nada que hacer en el
// servidor y agregarlo al bundle inicial pesaría de más. Vive en un archivo
// aparte porque `dynamic(..., { ssr: false })` solo puede llamarse desde un
// Client Component — Hero.tsx sigue siendo Server Component.
const Frasco3D = dynamic(() => import("./Frasco3D"), { ssr: false });

export default function Frasco3DOverlay() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // El Hero está siempre al tope de la página — apenas el usuario scrollea
  // unas pantallas, este canvas de three.js (su propio contexto WebGL,
  // aparte del shader de fondo) seguía rotando/renderizando fuera de vista
  // el resto de la sesión. frameloop="never" corta el render loop de R3F
  // por completo mientras no está en pantalla, sin tocar la rotación en sí.
  const [enPantalla, setEnPantalla] = useState(true);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setEnPantalla(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute flex items-center justify-center pointer-events-none
        inset-x-4 top-[calc(var(--header-height,72px)-6px)] h-[42svh]
        md:inset-x-auto md:right-[6%] md:w-[34%] md:h-[90%]"
    >
      {/* Mobile: frasco arriba, centrado y angosto, con el texto acomodado
          debajo (ver Hero.tsx). Desktop: columna a la derecha, centrada
          verticalmente. El margen de cámara en Frasco3D.tsx ya garantiza
          que no se corte con la tapa en ninguno de los dos casos.
          Sin touch-none a propósito: bloqueaba el scroll táctil de toda la
          página con el dedo apoyado sobre el frasco (iOS y Android), y el
          usuario quedaba "trabado" en el hero. Se prioriza poder scrollear
          la página por sobre poder rotar el frasco arrastrando con un dedo
          en mobile — sigue rotando solo, y con mouse en desktop se puede
          arrastrar igual (touch-action ahí no aplica). */}
      <div className="w-[92%] h-full md:w-full pointer-events-auto">
        <Frasco3D activo={enPantalla} />
      </div>
    </div>
  );
}
