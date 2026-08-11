"use client";

import { useActionState, useState } from "react";
import type { Categoria } from "@/lib/types";
import type { EstadoCategoria } from "./actions";
import ImagenCategoriaSubidor from "@/components/admin/ImagenCategoriaSubidor";

const ESTADO_INICIAL: EstadoCategoria = { error: null };

export default function CategoriaForm({
  categoria,
  action,
}: {
  categoria?: Categoria;
  action: (prevState: EstadoCategoria, formData: FormData) => Promise<EstadoCategoria>;
}) {
  const [estado, formAction, pendiente] = useActionState(action, ESTADO_INICIAL);
  // Tamaños de carga libre, no una lista fija — cada categoría define los
  // suyos (ver schema.prisma). Se editan como una lista de chips: escribís
  // un número y lo agregás, cada chip tiene su ✕ para sacarlo.
  const [tamanos, setTamanos] = useState<number[]>(categoria?.mililitrosDisponibles ?? []);
  const [tamanoNuevo, setTamanoNuevo] = useState("");

  function agregarTamano() {
    const ml = Math.floor(Number(tamanoNuevo));
    if (!Number.isFinite(ml) || ml <= 0) return;
    if (!tamanos.includes(ml)) {
      setTamanos((prev) => [...prev, ml].sort((a, b) => a - b));
    }
    setTamanoNuevo("");
  }

  function quitarTamano(ml: number) {
    setTamanos((prev) => prev.filter((x) => x !== ml));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Nombre">
          <input name="nombre" required defaultValue={categoria?.nombre} className="campo-admin" />
        </Campo>
        <Campo label="Slug (opcional)">
          <input name="slug" defaultValue={categoria?.slug} className="campo-admin" />
          <p className="text-xs text-on-surface-muted mt-1">
            Si lo dejás vacío, se genera solo a partir del nombre.
          </p>
        </Campo>
      </div>

      <Campo label="Tamaños disponibles">
        <p className="text-xs text-on-surface-muted mb-2">
          Los productos de esta categoría solo van a poder elegir tamaños de esta lista. También se
          puede sumar un tamaño nuevo directamente al cargar un producto.
        </p>

        {tamanos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tamanos.map((ml) => (
              <span
                key={ml}
                className="flex items-center gap-1.5 border border-accent bg-accent text-on-accent px-3 py-2 text-sm"
              >
                <input type="hidden" name="mililitrosDisponibles" value={ml} />
                {ml} ml
                <button
                  type="button"
                  onClick={() => quitarTamano(ml)}
                  aria-label={`Quitar ${ml} ml`}
                  className="hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={tamanoNuevo}
            onChange={(e) => setTamanoNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarTamano();
              }
            }}
            placeholder="Ej: 30"
            className="campo-admin w-32"
            aria-label="Nuevo tamaño en ml"
          />
          <button
            type="button"
            onClick={agregarTamano}
            className="border border-border text-on-surface text-sm font-semibold px-4 hover:border-accent hover:text-accent transition-colors"
          >
            + Agregar tamaño
          </button>
        </div>
      </Campo>

      <Campo label="Imagen (obligatoria — tarjeta de acceso directo en la home)">
        <ImagenCategoriaSubidor name="imagenUrl" valorInicial={categoria?.imagenUrl ?? undefined} />
      </Campo>

      {estado.error && <p className="text-sm text-error">{estado.error}</p>}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors disabled:opacity-50"
      >
        {pendiente ? "Guardando..." : categoria ? "Guardar cambios" : "Crear categoría"}
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
