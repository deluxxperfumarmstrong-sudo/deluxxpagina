import Link from "next/link";
import HeroShader from "./HeroShader";
import Frasco3DOverlay from "./Frasco3DOverlay";
import { SLOGAN } from "@/lib/config";

export default function Hero() {
  return (
    <section className="relative min-h-screen min-h-svh w-full overflow-hidden">
      <HeroShader>
        <Frasco3DOverlay />
        {/* Mobile: el bloque de texto arranca justo debajo de la zona del
            frasco (42svh + alto del header + margen), calculado en vh en vez
            de heredar "h-full + justify-end" — con ese approach anterior, el
            texto quedaba anclado al fondo del hero suponiendo que su altura
            iba a entrar siempre debajo del frasco por casualidad; en cuanto
            el título creció (9vw → 14vw) dejó de entrar y se solapaba por
            arriba. Ahora la separación está garantizada por cálculo, no por
            coincidencia, y como la sección es min-h-svh (no h-svh fijo), si
            el contenido llegara a necesitar más alto (texto grande de
            accesibilidad, etc.) la sección crece en vez de recortarlo.
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
            Perfumería árabe, de nicho y de diseñador. Por encargo o en stock,
            con muestras para probar antes de comprar.
          </p>
          <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4">
            <Link
              href="/catalogo"
              className="whitespace-nowrap bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
            >
              Ver catálogo
            </Link>
            <Link
              href="/muestras"
              className="whitespace-nowrap border border-accent-text text-accent-text font-[var(--font-body)] font-bold text-sm uppercase tracking-[0.08em] px-[32px] py-[16px] hover:bg-accent hover:text-on-accent hover:border-accent transition-colors"
            >
              Pedir muestra
            </Link>
          </div>
        </div>
      </HeroShader>
    </section>
  );
}
