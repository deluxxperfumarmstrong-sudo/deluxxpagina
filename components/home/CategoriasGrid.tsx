import Link from "next/link";
import Image from "next/image";
import type { Categoria } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";

export default function CategoriasGrid({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14">
      <h2 className="font-display text-3xl md:text-4xl text-on-background mb-6">Categorías</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {categorias.map((cat, i) => (
          <Reveal key={cat.slug} delayMs={i * 80}>
          <Link
            href={`/categoria/${cat.slug}`}
            className="group relative rounded-sm p-6 md:p-8 flex items-end justify-end aspect-square overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              {/* Fallback color in case the image fails to load or is not found */}
              <div className="absolute inset-0 bg-surface" />
              <Image
                src={`/categorias/${cat.slug}.png`}
                alt={cat.nombre}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <span className="font-display text-2xl md:text-3xl text-white group-hover:text-accent transition-colors leading-tight">
                {cat.nombre}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:stroke-accent"
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
