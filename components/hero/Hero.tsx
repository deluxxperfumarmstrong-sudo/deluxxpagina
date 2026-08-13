import Link from "next/link";
import HeroShader from "./HeroShader";
import Frasco3DOverlay from "./Frasco3DOverlay";
import { SLOGAN } from "@/lib/config";

export default function Hero() {
  return (
    <section
      className="relative h-screen h-svh w-full overflow-hidden"
      // HeaderSpacer ahora siempre se renderiza (ver HeaderSpacer.tsx) — acá
      // se cancela ese espacio para que el hero siga arrancando desde el
      // borde superior real de la página, con el header flotando
      // transparente encima, como estaba pensado.
      style={{ marginTop: "calc(-1 * var(--header-height, 72px))" }}
    >
      <HeroShader>
        <Frasco3DOverlay />
        {/* Mobile: el bloque de texto arranca justo debajo de la zona del
            frasco (42svh + alto del header + margen), calculado en vh en vez
            de heredar "h-full + justify-end" — con ese approach anterior, el
            texto quedaba anclado al fondo del hero suponiendo que su altura
            iba a entrar siempre debajo del frasco por casualidad; en cuanto
            el título creció (9vw → 14vw) dejó de entrar y se solapaba por
            arriba. Ahora la separación está garantizada por cálculo, no por
            coincidencia.
            La sección de arriba es h-svh (alto fijo), no min-h-svh: se
            probó min-h-svh para que creciera si el contenido necesitaba más
            alto, pero un h-full en un hijo de un contenedor con solo
            min-height (sin height) no se puede resolver contra el padre y
            colapsa al alto de SU contenido — eso rompía el shader y el
            centrado vertical en desktop (el canvas y este mismo div, ambos
            h-full, se encogían a la mitad de la pantalla en vez de llenarla).
            pt-, no mt-: este div es el primer hijo en flujo del wrapper
            "relative z-10" de HeroShader (el frasco es position:absolute,
            no cuenta) — un margin-top ahí colapsa a través del wrapper (que
            no tiene padding/borde que lo frene) y termina empujando al
            wrapper entero para abajo, corriendo con él al frasco 3D
            (position:absolute, relativo a ese mismo wrapper). padding-top
            nunca colapsa, así que logra el mismo empujón sin arrastrar nada
            más — ver Frasco3DOverlay.tsx para el otro lado de este cálculo. */}
        <div
          className="relative flex flex-col items-start px-4 md:px-12 max-w-3xl
            pt-[calc(42svh_+_var(--header-height,72px)_+_24px)] pb-10
            md:pt-[var(--header-height,72px)] md:h-full md:justify-center md:pb-0"
        >
          <h1 className="font-display italic leading-none flex flex-nowrap items-baseline gap-x-2 sm:gap-x-3 drop-shadow-[0_4px_28px_rgba(0,0,0,0.75)]">
            <span className="text-primary text-[14vw] sm:text-5xl md:text-8xl xl:text-9xl">
              DELUXX
            </span>
            <span className="text-accent text-[14vw] sm:text-5xl md:text-8xl xl:text-9xl">
              PERFUM
            </span>
          </h1>
          <p className="mt-3 md:mt-3 font-display italic text-accent text-xl sm:text-2xl md:text-3xl drop-shadow-[0_3px_18px_rgba(0,0,0,0.85)]">
            {SLOGAN}
          </p>
          <p className="mt-4 md:mt-7 max-w-lg font-[var(--font-body)] font-semibold text-on-background text-base sm:text-xl md:text-2xl leading-snug drop-shadow-[0_3px_18px_rgba(0,0,0,0.85)]">
            Perfumería árabe, de nicho y de diseñador. Por pedido o en stock,
            con muestras para probar antes de comprar.
          </p>
          {/* Los dos botones van siempre en una sola fila, uno al lado del
              otro — con flex-wrap + el padding de desktop (32px) no entraban
              juntos en mobile y "Pedir muestra" caía a una segunda línea.
              flex-1 en mobile (cada uno mitad del ancho) + padding más chico
              hace que entren de punta a punta; md: vuelve al ancho de
              contenido + padding grande de siempre. */}
          <div className="mt-6 md:mt-8 flex gap-3 md:gap-4">
            <Link
              href="/catalogo"
              className="flex-1 md:flex-initial text-center whitespace-nowrap bg-primary text-on-primary font-[var(--font-body)] font-semibold text-xs sm:text-sm uppercase tracking-wide px-4 sm:px-6 md:px-[32px] py-[14px] md:py-[16px] hover:bg-[#E8E8E8] transition-colors"
            >
              Ver catálogo
            </Link>
            <Link
              href="/muestras"
              className="flex-1 md:flex-initial text-center whitespace-nowrap border border-accent-text text-accent-text font-[var(--font-body)] font-bold text-xs sm:text-sm uppercase tracking-[0.08em] px-4 sm:px-6 md:px-[32px] py-[14px] md:py-[16px] hover:bg-accent hover:text-on-accent hover:border-accent transition-colors"
            >
              Pedir muestra
            </Link>
          </div>
        </div>
      </HeroShader>
    </section>
  );
}
