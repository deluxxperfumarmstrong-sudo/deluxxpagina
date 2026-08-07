import { notFound } from "next/navigation";
import { getCategoriasAdmin, getProductoPorId } from "@/lib/data";
import ProductoForm from "../ProductoForm";
import { actualizarProductoAction } from "../actions";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categorias, producto] = await Promise.all([
    getCategoriasAdmin(),
    getProductoPorId(id),
  ]);

  if (!producto) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-2">Editar producto</h1>
      <p className="text-sm text-on-surface-muted mb-8">{producto.nombre}</p>
      <ProductoForm
        categorias={categorias}
        producto={producto}
        action={actualizarProductoAction.bind(null, id)}
      />
    </div>
  );
}
