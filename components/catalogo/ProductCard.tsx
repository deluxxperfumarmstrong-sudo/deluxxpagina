import Link from "next/link";
import type { Producto } from "@/lib/types";
import { precioDesde } from "@/lib/precio";
import { formatoPrecio } from "@/lib/formato";
import ImagenProducto from "@/components/ui/ImagenProducto";

export default function ProductCard({ producto }: { producto: Producto }) {
  const desde = precioDesde(producto);

  return (
    <Link
      href={`/producto/${producto.slug}`}
      className="group block bg-surface rounded-sm p-4 hover:bg-surface-raised transition-colors"
    >
      <div className="relative aspect-[3/4] mb-4 overflow-hidden">
        <ImagenProducto
          publicId={producto.imagenes[0]}
          nombre={producto.nombre}
          className="absolute inset-0"
        />
        <div className="absolute top-2 left-2 right-2 flex flex-col gap-1 items-start">
          <span className="chip-tag bg-surface-raised text-on-surface-muted text-[0.6rem] md:text-[0.65rem] rounded-full px-2 md:px-3 py-0.5 md:py-1 uppercase tracking-wide whitespace-nowrap">
            {producto.tipo === "ENCARGO" ? "Por encargo" : "En stock"}
          </span>
          {producto.tieneMuestra && (
            <span className="chip-tag bg-surface-raised text-on-surface-muted text-[0.6rem] md:text-[0.65rem] rounded-full px-2 md:px-3 py-0.5 md:py-1 uppercase tracking-wide whitespace-nowrap max-w-full truncate">
              Muestra disponible
            </span>
          )}
        </div>
      </div>
      <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">
        {producto.categoria.nombre}
      </p>
      <h3 className="font-display text-lg text-on-surface leading-tight mb-2 group-hover:text-accent transition-colors">
        {producto.nombre}
      </h3>
      <p className="font-[var(--font-body)] font-semibold text-primary">
        Desde {formatoPrecio(desde)}
      </p>
    </Link>
  );
}
