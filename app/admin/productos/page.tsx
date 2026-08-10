import Link from "next/link";
import { getProductosAdmin } from "@/lib/data";
import ProductosOrdenables from "@/components/admin/ProductosOrdenables";

export default async function AdminProductosPage() {
  const productos = await getProductosAdmin();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-on-background mb-1">Productos</h1>
          <p className="text-sm text-on-surface-muted">{productos.length} en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-6 py-3 hover:bg-[#E8E8E8] transition-colors"
        >
          Nuevo producto
        </Link>
      </div>

      <ProductosOrdenables productosIniciales={productos} />
    </div>
  );
}
