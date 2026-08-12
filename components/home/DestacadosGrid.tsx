import Link from "next/link";
import type { Producto } from "@/lib/types";
import ProductCard from "@/components/catalogo/ProductCard";
import Reveal from "@/components/ui/Reveal";

export default function DestacadosGrid({ productos }: { productos: Producto[] }) {
  if (productos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-12 py-10 md:py-14">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-display text-3xl md:text-4xl text-on-background">Destacados</h2>
        <Link href="/catalogo" className="text-sm text-accent-text hover:underline">
          Ver todo el catálogo →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
        {productos.map((producto, i) => (
          <Reveal key={producto.id} delayMs={(i % 4) * 70}>
            <ProductCard producto={producto} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
