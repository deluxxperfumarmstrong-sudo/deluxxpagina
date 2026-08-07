"use client";

import { useActionState, useState } from "react";
import { MILILITROS_VALIDOS } from "@/lib/config";
import type { Categoria, Producto } from "@/lib/types";
import type { EstadoProducto } from "./actions";

const ESTADO_INICIAL: EstadoProducto = { error: null };

export default function ProductoForm({
  categorias,
  producto,
  action,
}: {
  categorias: Categoria[];
  producto?: Producto;
  action: (prevState: EstadoProducto, formData: FormData) => Promise<EstadoProducto>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, ESTADO_INICIAL);
  const [mlSeleccionados, setMlSeleccionados] = useState<number[]>(
    producto?.mililitros ?? []
  );
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);

  function toggleMl(ml: number) {
    setMlSeleccionados((prev) =>
      prev.includes(ml) ? prev.filter((x) => x !== ml) : [...prev, ml].sort((a, b) => a - b)
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Nombre">
          <input
            name="nombre"
            required
            defaultValue={producto?.nombre}
            className="campo-admin"
          />
        </Campo>
        <Campo label="Slug">
          <input name="slug" required defaultValue={producto?.slug} className="campo-admin" />
        </Campo>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Categoría">
          <select
            name="categoriaId"
            required
            defaultValue={producto?.categoriaId}
            className="campo-admin"
          >
            <option value="">Elegir...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Tipo">
          <select name="tipo" defaultValue={producto?.tipo ?? "STOCK"} className="campo-admin">
            <option value="STOCK">En stock</option>
            <option value="ENCARGO">Por encargo</option>
          </select>
        </Campo>
      </div>

      <Campo label="Notas olfativas (opcional)">
        <input name="notas" defaultValue={producto?.notas ?? ""} className="campo-admin" />
      </Campo>

      <Campo label="Descripción (opcional)">
        <textarea
          name="descripcion"
          defaultValue={producto?.descripcion ?? ""}
          rows={3}
          className="campo-admin"
        />
      </Campo>

      <div>
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-2">
          Tamaños y precio (regla 8 — cada ml elegido necesita un precio)
        </p>
        <div className="flex flex-col gap-2">
          {MILILITROS_VALIDOS.map((ml) => {
            const activo = mlSeleccionados.includes(ml);
            return (
              <div key={ml} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-20 shrink-0">
                  <input
                    type="checkbox"
                    name="mililitros"
                    value={ml}
                    checked={activo}
                    onChange={() => toggleMl(ml)}
                  />
                  <span className="text-sm text-on-surface">{ml} ml</span>
                </label>
                <input
                  type="number"
                  name={`precio_${ml}`}
                  min={0}
                  placeholder="Precio $"
                  disabled={!activo}
                  defaultValue={producto?.precios[String(ml)] ?? ""}
                  className="campo-admin flex-1 disabled:opacity-30"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Cantidad en stock">
          <input
            type="number"
            name="cantidad"
            min={0}
            defaultValue={producto?.cantidad ?? 0}
            className="campo-admin"
          />
        </Campo>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Imagen 1 — public_id de Cloudinary (opcional)">
          <input
            name="imagen1"
            defaultValue={producto?.imagenes[0] ?? ""}
            className="campo-admin"
          />
        </Campo>
        <Campo label="Imagen 2 — public_id de Cloudinary (opcional)">
          <input
            name="imagen2"
            defaultValue={producto?.imagenes[1] ?? ""}
            className="campo-admin"
          />
        </Campo>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input type="checkbox" name="tieneMuestra" defaultChecked={producto?.tieneMuestra} />
          Tiene muestra disponible
        </label>
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={producto?.activo ?? true}
          />
          Activo (visible en el catálogo)
        </label>

        {/* "Destacado" en dorado (warning de design.md) es una excepción
            puntual pedida explícitamente — el resto del sitio se queda en
            gris + rojo, esto no es un segundo acento de uso libre. */}
        <button
          type="button"
          aria-pressed={destacado}
          onClick={() => setDestacado((v) => !v)}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 border transition-colors ${
            destacado
              ? "bg-warning border-warning text-on-primary"
              : "border-border text-on-surface-muted hover:border-warning hover:text-warning"
          }`}
        >
          <span aria-hidden="true">★</span> Destacado
        </button>
        <input type="hidden" name="destacado" value={destacado ? "on" : ""} />
      </div>

      {estado.error && <p className="text-sm text-error">{estado.error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#E8E8E8] transition-colors disabled:opacity-50"
      >
        {pendiente ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
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
