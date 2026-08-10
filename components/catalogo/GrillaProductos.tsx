import type { Producto } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function GrillaProductos({ productos }: { productos: Producto[] }) {
  if (productos.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border-subtle">
        <p className="text-on-surface-muted">
          No hay productos que coincidan con estos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}
