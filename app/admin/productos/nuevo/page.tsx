import { getCategoriasAdmin, contarProductosDestacados } from "@/lib/data";
import ProductoForm from "../ProductoForm";
import { crearProductoAction } from "../actions";

export default async function NuevoProductoPage() {
  const [categorias, destacadosActuales] = await Promise.all([
    getCategoriasAdmin(),
    contarProductosDestacados(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-8">Nuevo producto</h1>
      <ProductoForm
        categorias={categorias}
        action={crearProductoAction}
        destacadosActuales={destacadosActuales}
      />
    </div>
  );
}
