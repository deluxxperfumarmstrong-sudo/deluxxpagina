import CategoriaForm from "../CategoriaForm";
import { crearCategoriaAction } from "../actions";

export default function NuevaCategoriaPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-8">Nueva categoría</h1>
      <CategoriaForm action={crearCategoriaAction} />
    </div>
  );
}
