import Link from "next/link";
import type { Categoria } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";
import ImagenCategoria from "./ImagenCategoria";

// El grid se ajusta a cuántas categorías hay en vez de una grilla fija de 3
// — con 1 o 2 categorías, 3 columnas dejaban huecos vacíos y tarjetas
// desproporcionadamente angostas; con 4+, 3 columnas dejaban una fila corta
// suelta. Mobile se queda en 1 columna hasta 3 categorías (tarjetas legibles
// de punta a punta) y pasa a 2 recién en 4+, para no apilar demasiadas
// tarjetas cuadradas una debajo de la otra.
function columnasSegunCantidad(cantidad: number): string {
  if (cantidad <= 1) return "grid-cols-1";
  if (cantidad === 2) return "grid-cols-1 sm:grid-cols-2";
  if (cantidad === 3) return "grid-cols-1 sm:grid-cols-3";
  return "grid-cols-2 sm:grid-cols-4";
}

// El atributo `sizes` que le pide cada celda a Cloudinary tiene que
// coincidir con las clases de arriba — es la misma cuenta de columnas,
// solo que expresada como ancho de viewport en vez de clases de Tailwind.
// "sm" es el breakpoint real de la grilla (640px): usar 768 acá, como
// tenía antes, no correspondía con el CSS real y sobrepedía imagen en el
// rango 640-768px además del error mayor de mobile.
function sizesSegunCantidad(cantidad: number): string {
  if (cantidad <= 1) return "100vw";
  if (cantidad === 2) return "(max-width: 640px) 100vw, 50vw";
  if (cantidad === 3) return "(max-width: 640px) 100vw, 33vw";
  return "(max-width: 640px) 50vw, 25vw";
}

export default function CategoriasGrid({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  const sizes = sizesSegunCantidad(categorias.length);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-12 py-10 md:py-14">
      <h2 className="font-display text-3xl md:text-4xl text-on-background mb-6">Categorías</h2>
      <div className={`grid ${columnasSegunCantidad(categorias.length)} gap-4 md:gap-6`}>
        {categorias.map((cat, i) => (
          <Reveal key={cat.slug} delayMs={i * 80}>
            <Link
              href={`/categoria/${cat.slug}`}
              className="group relative rounded-sm aspect-square overflow-hidden block"
            >
              <div className="absolute inset-0 z-0">
                {/* Fallback color in case the image fails to load or is not found */}
                <div className="absolute inset-0 bg-surface" />
                <ImagenCategoria slug={cat.slug} nombre={cat.nombre} imagenUrl={cat.imagenUrl} sizes={sizes} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
              </div>

              <div className="absolute z-10 bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-1">
                <span className="font-[var(--font-body)] font-semibold uppercase tracking-wide text-base md:text-lg text-white group-hover:text-accent transition-colors leading-none">
                  {cat.nombre}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:stroke-accent"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
