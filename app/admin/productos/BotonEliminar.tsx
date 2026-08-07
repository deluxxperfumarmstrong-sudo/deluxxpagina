"use client";

import { eliminarProductoAction } from "./actions";

export default function BotonEliminar({ id, nombre }: { id: string; nombre: string }) {
  return (
    <form
      action={eliminarProductoAction.bind(null, id)}
      onSubmit={(e) => {
        // Un <form action> real (no una llamada imperativa a la Server
        // Action): solo así Next.js refresca automáticamente la ruta
        // actual después de mutar. Con una llamada imperativa sin
        // redirect(), la mutación en memoria pasaba pero la página se
        // quedaba mostrando el árbol viejo hasta la próxima navegación.
        if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-error font-semibold hover:text-on-accent hover:bg-error px-2 py-1 transition-colors"
      >
        Eliminar
      </button>
    </form>
  );
}
