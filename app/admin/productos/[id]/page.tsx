import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoriasAdmin, getProductoPorId, contarProductosDestacados } from "@/lib/data";
import ProductoForm from "../ProductoForm";
import { actualizarProductoAction } from "../actions";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categorias, producto, destacadosActuales] = await Promise.all([
    getCategoriasAdmin(),
    getProductoPorId(id),
    contarProductosDestacados(),
  ]);

  if (!producto) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-2">Editar producto</h1>
      <div className="flex items-center gap-3 mb-8">
        <p className="text-sm text-on-surface-muted">{producto.nombre}</p>
        {producto.activo ? (
          <Link
            href={`/producto/${producto.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-text hover:underline"
          >
            Ver en el sitio →
          </Link>
        ) : (
          <span
            className="text-sm text-on-surface-muted/50"
            title="Inactivo — no tiene página pública"
          >
            Ver en el sitio →
          </span>
        )}
      </div>
      <ProductoForm
        categorias={categorias}
        producto={producto}
        action={actualizarProductoAction.bind(null, id)}
        destacadosActuales={destacadosActuales}
      />
    </div>
  );
}
