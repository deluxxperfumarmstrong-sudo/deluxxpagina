import Link from "next/link";
import { getProductosAdmin } from "@/lib/data";
import { formatoPrecio } from "@/lib/formato";
import { precioDesde } from "@/lib/precio";
import BotonEliminar from "./BotonEliminar";

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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-on-surface-muted border-b border-border-subtle">
              <th className="py-3 pr-4">Nombre</th>
              <th className="py-3 pr-4">Categoría</th>
              <th className="py-3 pr-4">Tipo</th>
              <th className="py-3 pr-4">Desde</th>
              <th className="py-3 pr-4">Estado</th>
              <th className="py-3 pr-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-b border-border-subtle">
                <td className="py-3 pr-4 text-on-background font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    {p.destacado && (
                      <span className="text-warning" title="Destacado" aria-label="Destacado">
                        ★
                      </span>
                    )}
                    {p.nombre}
                  </span>
                </td>
                <td className="py-3 pr-4 text-on-surface-muted">{p.categoria.nombre}</td>
                <td className="py-3 pr-4 text-on-surface-muted">
                  {p.tipo === "ENCARGO" ? "Encargo" : "Stock"}
                </td>
                <td className="py-3 pr-4 text-on-surface-muted">
                  {formatoPrecio(precioDesde(p))}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-surface-raised ${
                      p.activo ? "text-success" : "text-on-surface-muted"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="text-on-surface hover:text-accent transition-colors"
                    >
                      Editar
                    </Link>
                    <BotonEliminar id={p.id} nombre={p.nombre} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
