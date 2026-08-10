"use client";

import { useActionState, useState } from "react";
import { MILILITROS_VALIDOS } from "@/lib/config";
import type { EstadoCategoria } from "./actions";
import ImagenCategoriaSubidor from "@/components/admin/ImagenCategoriaSubidor";

const ESTADO_INICIAL: EstadoCategoria = { error: null };

export default function CategoriaForm({
  action,
}: {
  action: (prevState: EstadoCategoria, formData: FormData) => Promise<EstadoCategoria>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, ESTADO_INICIAL);
  const [mlSeleccionados, setMlSeleccionados] = useState<number[]>([]);

  function toggleMl(ml: number) {
    setMlSeleccionados((prev) =>
      prev.includes(ml) ? prev.filter((x) => x !== ml) : [...prev, ml].sort((a, b) => a - b)
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Nombre">
          <input name="nombre" required className="campo-admin" />
        </Campo>
        <Campo label="Slug (opcional)">
          <input name="slug" className="campo-admin" />
          <p className="text-xs text-on-surface-muted mt-1">
            Si lo dejás vacío, se genera solo a partir del nombre.
          </p>
        </Campo>
      </div>

      <Campo label="Tamaños disponibles">
        <p className="text-xs text-on-surface-muted mb-2">
          Los productos de esta categoría solo van a poder elegir tamaños de esta lista.
        </p>
        <div className="flex flex-wrap gap-2">
          {MILILITROS_VALIDOS.map((ml) => {
            const activo = mlSeleccionados.includes(ml);
            return (
              <label
                key={ml}
                className={`flex items-center gap-2 border px-3 py-2 cursor-pointer transition-colors ${
                  activo ? "border-accent text-accent" : "border-border text-on-surface-muted"
                }`}
              >
                <input
                  type="checkbox"
                  name="mililitrosDisponibles"
                  value={ml}
                  checked={activo}
                  onChange={() => toggleMl(ml)}
                  className="sr-only"
                />
                <span className="text-sm">{ml} ml</span>
              </label>
            );
          })}
        </div>
      </Campo>

      <Campo label="Imagen (obligatoria — tarjeta de acceso directo en la home)">
        <ImagenCategoriaSubidor name="imagenUrl" />
      </Campo>

      {estado.error && <p className="text-sm text-error">{estado.error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors disabled:opacity-50"
      >
        {pendiente ? "Guardando..." : "Crear categoría"}
      </button>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-on-surface-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
