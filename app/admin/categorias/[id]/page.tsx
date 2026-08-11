import { notFound } from "next/navigation";
import { getCategoriaPorId } from "@/lib/data";
import CategoriaForm from "../CategoriaForm";
import { actualizarCategoriaAction } from "../actions";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await getCategoriaPorId(id);
  if (!categoria) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-8">Editar categoría</h1>
      <CategoriaForm categoria={categoria} action={actualizarCategoriaAction.bind(null, id)} />
    </div>
  );
}
