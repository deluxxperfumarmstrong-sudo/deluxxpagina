import Link from "next/link";
import HeroShader from "./HeroShader";
import Frasco3DOverlay from "./Frasco3DOverlay";
import { SLOGAN } from "@/lib/config";

export default function Hero() {
  return (
    <section className="relative h-screen h-svh w-full overflow-hidden">
      <HeroShader>
        <Frasco3DOverlay />
        <div
          className="relative h-full flex flex-col items-start justify-end md:justify-center px-4 md:px-12 pb-12 md:pb-0 max-w-3xl"
          style={{ paddingTop: "var(--header-height, 72px)" }}
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
