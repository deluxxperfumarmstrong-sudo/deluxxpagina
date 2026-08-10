"use client";

import { useActionState, useState } from "react";
import { MILILITROS_VALIDOS, MAX_DESTACADOS } from "@/lib/config";
import type { Categoria, Producto } from "@/lib/types";
import type { EstadoProducto } from "./actions";
import ImagenesOrdenables from "@/components/admin/ImagenesOrdenables";

const ESTADO_INICIAL: EstadoProducto = { error: null };

export default function ProductoForm({
  categorias,
  producto,
  action,
  destacadosActuales,
}: {
  categorias: Categoria[];
  producto?: Producto;
  action: (prevState: EstadoProducto, formData: FormData) => Promise<EstadoProducto>;
  // Conteo tomado al cargar la página — no se refresca en vivo (otro admin
  // podría estar tocando destacados a la vez), pero alcanza para el aviso:
  // el límite real lo termina de aplicar el usuario mirando el contador de
  // /admin/productos antes de guardar.
  destacadosActuales: number;
}) {
  const [estado, formAction, pendiente] = useActionState(action, ESTADO_INICIAL);
  const [mlSeleccionados, setMlSeleccionados] = useState<number[]>(
    producto?.mililitros ?? []
  );
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const yaEraDestacado = producto?.destacado ?? false;
  const limiteDestacadosAlcanzado = !yaEraDestacado && destacadosActuales >= MAX_DESTACADOS;

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
          <p className="text-xs text-on-surface-muted mt-1">
            Es la dirección web del producto (ej: deluxxperfum.com/producto/
            <span className="text-on-surface">este-texto</span>). Solo minúsculas, números y guiones,
            sin espacios ni tildes — tiene que ser único.
          </p>
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
          Tamaños, precio y stock (regla 8 — cada ml elegido necesita un precio)
        </p>
        {/* Encabezado de columnas — el checkbox de tamaño no lleva rótulo
            (ya se lee en la fila: "50 ml"), pero el resto sí, porque son
            varios inputs numéricos vacíos uno al lado del otro y sin esto no
            hay forma de saber cuál es cuál sin mirar el placeholder. */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
          <span className="w-20 shrink-0" aria-hidden="true" />
          <span className="flex-1 min-w-[100px] text-xs uppercase tracking-widest text-on-surface-muted">
            Precio $
          </span>
          <span className="flex-1 min-w-[100px] text-xs uppercase tracking-widest text-on-surface-muted">
            Con descuento (opcional)
          </span>
          <span className="w-20 shrink-0 text-xs uppercase tracking-widest text-on-surface-muted">
            Stock
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {MILILITROS_VALIDOS.map((ml) => {
            const activo = mlSeleccionados.includes(ml);
            return (
              <div key={ml} className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                <div className="flex-1 min-w-[100px]">
                  <input
                    type="number"
                    name={`precio_${ml}`}
                    min={0}
                    placeholder="Precio $"
                    disabled={!activo}
                    defaultValue={producto?.precios[String(ml)] ?? ""}
                    className="campo-admin disabled:opacity-30"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <input
                    type="number"
                    name={`descuento_${ml}`}
                    min={0}
                    placeholder="Sin descuento"
                    disabled={!activo}
                    defaultValue={producto?.preciosDescuento[String(ml)] ?? ""}
                    className="campo-admin disabled:opacity-30"
                  />
                </div>
                <div className="w-20 shrink-0">
                  <input
                    type="number"
                    name={`stock_${ml}`}
                    min={0}
                    placeholder="Stock"
                    disabled={!activo}
                    defaultValue={producto?.stock[String(ml)] ?? 0}
                    className="campo-admin disabled:opacity-30"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Campo label="Imágenes (opcional)">
        <ImagenesOrdenables name="imagenes" valorInicial={producto?.imagenes ?? []} />
      </Campo>

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
        <div className="flex flex-col gap-1">
          <button
            type="button"
            aria-pressed={destacado}
            disabled={!destacado && limiteDestacadosAlcanzado}
            title={
              !destacado && limiteDestacadosAlcanzado
                ? `Ya hay ${MAX_DESTACADOS} productos destacados — sacá uno antes de agregar otro.`
                : undefined
            }
            onClick={() => setDestacado((v) => !v)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              destacado
                ? "bg-warning border-warning text-on-primary"
                : "border-border text-on-surface-muted hover:border-warning hover:text-warning"
            }`}
          >
            <span aria-hidden="true">★</span> Destacado
          </button>
          {!destacado && limiteDestacadosAlcanzado && (
            <p className="text-xs text-error">
              Ya hay {MAX_DESTACADOS} destacados — sacá uno en /admin/productos antes de agregar otro.
            </p>
          )}
        </div>
        <input type="hidden" name="destacado" value={destacado ? "on" : ""} />
      </div>

      {estado.error && <p className="text-sm text-error">{estado.error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors disabled:opacity-50"
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
