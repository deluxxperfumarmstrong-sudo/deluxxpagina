import { getCategoriasAdmin, getProductosAdmin } from "@/lib/data";
import CategoriasOrdenables from "@/components/admin/CategoriasOrdenables";

export default async function AdminCategoriasPage() {
  const [categorias, productos] = await Promise.all([getCategoriasAdmin(), getProductosAdmin()]);

  const conteoPorCategoria: Record<string, number> = {};
  for (const p of productos) {
    if (!p.activo) continue;
    conteoPorCategoria[p.categoriaId] = (conteoPorCategoria[p.categoriaId] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-2">Categorías</h1>
      <p className="text-sm text-on-surface-muted mb-8">
        Solo se listan en el sitio las categorías activas que tengan al menos un producto
        activo (regla 6). Arrastrá para cambiar el orden en el catálogo.
      </p>

      <CategoriasOrdenables categoriasIniciales={categorias} conteoPorCategoria={conteoPorCategoria} />
    </div>
  );
}
