import Link from "next/link";
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl text-on-background">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-6 py-3 hover:bg-[#E8E8E8] transition-colors"
        >
          Nueva categoría
        </Link>
      </div>
      <p className="text-sm text-on-surface-muted mb-8">
        Solo se listan en el sitio las categorías activas que tengan al menos un producto
        activo (regla 6). Arrastrá para cambiar el orden en el catálogo.
      </p>

      <CategoriasOrdenables categoriasIniciales={categorias} conteoPorCategoria={conteoPorCategoria} />
    </div>
  );
}
