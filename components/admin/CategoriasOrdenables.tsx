"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Categoria } from "@/lib/types";
import IconoArrastre from "@/components/icons/IconoArrastre";
import {
  toggleCategoriaAction,
  reordenarCategoriasAction,
  eliminarCategoriaAction,
} from "@/app/admin/categorias/actions";

function Fila({
  categoria,
  cantidad,
  onEliminar,
}: {
  categoria: Categoria;
  cantidad: number;
  onEliminar: (id: string, nombre: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: categoria.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-3 py-4 border-b border-border-subtle ${
        isDragging ? "relative z-10 bg-surface-raised" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Arrastrar para reordenar ${categoria.nombre}`}
        // min-w-11/min-h-11 (44px), NO min-w-9: el paso 9 está overrideado a
        // 128px por la escala custom de globals.css.
        className="flex items-center justify-center min-w-11 min-h-11 text-on-surface-muted hover:text-accent cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <IconoArrastre className="w-5 h-5" />
      </button>

      {/* En mobile la fila entera (handle + nombre + badge + botones) no
          entraba en una sola línea — el badge "Activa" y "Desactivar"
          terminaban superpuestos sobre el nombre. flex-wrap en el
          contenedor + basis-full acá fuerza al nombre a ocupar su propia
          línea completa, y las acciones bajan a una segunda fila. Desde
          sm en adelante vuelve a ser todo una sola línea (flex-nowrap). */}
      <div className="flex-1 min-w-0 basis-full sm:basis-auto">
        <p className="font-display text-lg text-on-background truncate">{categoria.nombre}</p>
        <p className="text-xs text-on-surface-muted">
          {categoria.slug} · {cantidad} producto{cantidad === 1 ? "" : "s"} activo
          {cantidad === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto sm:shrink-0">
        <span
          className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-surface-raised ${
            categoria.activa ? "text-success" : "text-on-surface-muted"
          }`}
        >
          {categoria.activa ? "Activa" : "Inactiva"}
        </span>
        <form action={toggleCategoriaAction.bind(null, categoria.id)}>
          <button
            type="submit"
            className={`border text-sm font-semibold px-4 min-h-11 transition-colors ${
              categoria.activa
                ? "border-accent-text text-accent-text hover:bg-error hover:border-error hover:text-on-accent"
                : "border-success text-success hover:bg-success hover:text-on-accent"
            }`}
          >
            {categoria.activa ? "Desactivar" : "Activar"}
          </button>
        </form>
        <Link
          href={`/admin/categorias/${categoria.id}`}
          className="text-on-surface hover:text-accent transition-colors text-sm font-semibold px-2"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() => onEliminar(categoria.id, categoria.nombre)}
          className="text-error font-semibold hover:text-on-accent hover:bg-error px-2 py-1 transition-colors text-sm"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default function CategoriasOrdenables({
  categoriasIniciales,
  conteoPorCategoria,
}: {
  categoriasIniciales: Categoria[];
  conteoPorCategoria: Record<string, number>;
}) {
  const [categorias, setCategorias] = useState(categoriasIniciales);
  // Mismo problema que ProductosOrdenables.tsx: toggleCategoriaAction hace
  // redirect() a la misma ruta (navegación soft, no remonta este componente),
  // así que sin esto el botón Activar/Desactivar quedaba mostrando el
  // estado viejo para siempre — el toggle "no se veía" aunque sí se hubiera
  // guardado.
  useEffect(() => {
    setCategorias(categoriasIniciales);
  }, [categoriasIniciales]);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const anterior = categorias;
    setCategorias((prev) => prev.filter((c) => c.id !== id));
    const res = await eliminarCategoriaAction(id);
    if (res.error) {
      setCategorias(anterior);
      alert(res.error);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const anterior = categorias;
    const oldIndex = categorias.findIndex((c) => c.id === active.id);
    const newIndex = categorias.findIndex((c) => c.id === over.id);
    const reordenado = arrayMove(categorias, oldIndex, newIndex);
    setCategorias(reordenado);

    startTransition(() => {
      reordenarCategoriasAction(reordenado.map((c) => c.id)).catch(() => {
        setCategorias(anterior);
        alert("No se pudo guardar el nuevo orden — se deshizo el cambio. Probá de nuevo.");
      });
    });
  }

  return (
    <DndContext
      id="categorias-ordenables"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={categorias.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {categorias.map((cat) => (
            <Fila
              key={cat.id}
              categoria={cat}
              cantidad={conteoPorCategoria[cat.id] ?? 0}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
