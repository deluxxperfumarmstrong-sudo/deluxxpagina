import { getCategoriasAdmin, getProductosAdmin } from "@/lib/data";
import { toggleCategoriaAction } from "./actions";

export default async function AdminCategoriasPage() {
  const [categorias, productos] = await Promise.all([getCategoriasAdmin(), getProductosAdmin()]);

  const conteoPorCategoria = new Map<string, number>();
  for (const p of productos) {
    if (!p.activo) continue;
    conteoPorCategoria.set(p.categoriaId, (conteoPorCategoria.get(p.categoriaId) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-on-background mb-2">Categorías</h1>
      <p className="text-sm text-on-surface-muted mb-8">
        Solo se listan en el sitio las categorías activas que tengan al menos un producto
        activo (regla 6).
      </p>

      <div className="flex flex-col">
        {categorias.map((cat) => {
          const cantidad = conteoPorCategoria.get(cat.id) ?? 0;
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-4 py-4 border-b border-border-subtle"
            >
              <div>
                <p className="font-display text-lg text-on-background">{cat.nombre}</p>
                <p className="text-xs text-on-surface-muted">
                  {cat.slug} · {cantidad} producto{cantidad === 1 ? "" : "s"} activo
                  {cantidad === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-surface-raised ${
                    cat.activa ? "text-success" : "text-on-surface-muted"
                  }`}
                >
                  {cat.activa ? "Activa" : "Inactiva"}
                </span>
                <form action={toggleCategoriaAction.bind(null, cat.id)}>
                  <button
                    type="submit"
                    className={`border text-sm font-semibold px-4 py-2 transition-colors ${
                      cat.activa
                        ? "border-error text-error hover:bg-error hover:text-on-accent"
                        : "border-success text-success hover:bg-success hover:text-on-accent"
                    }`}
                  >
                    {cat.activa ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
