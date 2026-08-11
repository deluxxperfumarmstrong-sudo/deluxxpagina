"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import ImagenProducto from "@/components/ui/ImagenProducto";
import type { Producto } from "@/lib/types";
import { formatoPrecio } from "@/lib/formato";
import { precioDesde } from "@/lib/precio";
import {
  reordenarProductosAction,
  toggleProductoDestacadoAction,
  actualizarStockAction,
} from "@/app/admin/productos/actions";
import { MAX_DESTACADOS } from "@/lib/config";
import { limitaPorStock } from "@/lib/stock";
import IconoArrastre from "@/components/icons/IconoArrastre";
import BotonEliminar from "@/app/admin/productos/BotonEliminar";

// Cambios de stock pendientes de guardar, por producto y por ml — solo
// guarda las claves que difieren del valor original, así "hay cambios sin
// guardar" es simplemente "el mapa no está vacío" y no hace falta comparar
// deep-equal en cada render.
type StockPendiente = Record<string, Record<string, number>>;

function Fila({
  producto,
  arrastreHabilitado,
  onToggleDestacado,
  cambiosStock,
  onCambiarStock,
}: {
  producto: Producto;
  arrastreHabilitado: boolean;
  onToggleDestacado: (id: string) => void;
  cambiosStock: Record<string, number> | undefined;
  onCambiarStock: (id: string, ml: number, valor: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: producto.id,
    disabled: !arrastreHabilitado,
  });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border-b border-border-subtle ${isDragging ? "relative z-10 bg-surface-raised" : ""}`}
    >
      <td className="py-2 pr-2 w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={!arrastreHabilitado}
          aria-label={`Arrastrar para reordenar ${producto.nombre}`}
          title={
            arrastreHabilitado
              ? "Arrastrar para reordenar"
              : "Limpiá la búsqueda y el filtro de categoría para poder reordenar"
          }
          // min-w-11/min-h-11 (44px), NO min-w-9: el paso 9 está overrideado a
          // 128px por la escala custom de globals.css y estiraba cada fila.
          className="flex items-center justify-center min-w-11 min-h-11 text-on-surface-muted enabled:hover:text-accent enabled:cursor-grab enabled:active:cursor-grabbing touch-none disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <IconoArrastre className="w-5 h-5" />
        </button>
      </td>
      <td className="py-2 pr-4 w-14">
        <div className="relative w-11 h-11 rounded-sm overflow-hidden bg-surface-raised border border-border-subtle shrink-0">
          <ImagenProducto
            publicId={producto.imagenes[0]}
            nombre={producto.nombre}
            className="absolute inset-0"
            sizes="44px"
          />
        </div>
      </td>
      <td className="py-2 pr-2 w-8">
        <button
          type="button"
          onClick={() => onToggleDestacado(producto.id)}
          aria-pressed={producto.destacado}
          aria-label={producto.destacado ? `Quitar ${producto.nombre} de destacados` : `Marcar ${producto.nombre} como destacado`}
          title={producto.destacado ? "Quitar de destacados" : "Marcar como destacado"}
          className={`flex items-center justify-center min-w-11 min-h-11 text-lg transition-colors ${
            producto.destacado ? "text-warning" : "text-on-surface-muted hover:text-warning"
          }`}
        >
          ★
        </button>
      </td>
      <td className="py-2 pr-4 text-on-background font-semibold">{producto.nombre}</td>
      <td className="py-2 pr-4 text-on-surface-muted whitespace-nowrap">
        {producto.categoria.nombre}
      </td>
      <td className="py-2 pr-4 text-on-surface-muted whitespace-nowrap">
        {producto.tipo === "ENCARGO" ? "Pedido" : "Stock"}
      </td>
      <td className="py-2 pr-4">
        {limitaPorStock(producto) ? (
          <div className="flex flex-wrap gap-1.5">
            {producto.mililitros.map((ml) => {
              const valor = cambiosStock?.[String(ml)] ?? producto.stock[String(ml)] ?? 0;
              const modificado = cambiosStock?.[String(ml)] !== undefined;
              return (
                <label
                  key={ml}
                  className="flex items-center gap-1"
                  title={`Stock de ${ml}ml${modificado ? " (sin guardar)" : ""}`}
                >
                  <span className="text-xs text-on-surface-muted">{ml}ml</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={valor}
                    onChange={(e) => {
                      const n = Math.max(0, Math.floor(Number(e.target.value)));
                      onCambiarStock(producto.id, ml, Number.isNaN(n) ? 0 : n);
                    }}
                    aria-label={`Stock de ${producto.nombre} en ${ml}ml`}
                    // min-h-[36px], NO min-h-9: el paso 9 está overrideado a
                    // 128px por la escala custom de globals.css (mismo
                    // problema que ya se documentó para min-w-9 en el botón
                    // de arrastre más arriba) — con min-h-9 cada input de
                    // stock se inflaba a un rectángulo de 128px+ de alto.
                    className={`w-14 min-h-[36px] px-1.5 py-1 text-sm bg-surface border rounded-sm text-on-background focus:outline-none focus:ring-1 focus:ring-accent transition-colors ${
                      modificado
                        ? "border-warning ring-1 ring-warning/40"
                        : valor === 0
                          ? "border-error/40 text-error"
                          : "border-border-subtle"
                    }`}
                  />
                </label>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-on-surface-muted/60">No aplica</span>
        )}
      </td>
      <td className="py-2 pr-4 text-on-surface-muted whitespace-nowrap">
        {formatoPrecio(precioDesde(producto))}
      </td>
      <td className="py-2 pr-4">
        <span
          className={`text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-surface-raised whitespace-nowrap ${
            producto.activo ? "text-success" : "text-on-surface-muted"
          }`}
        >
          {producto.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center justify-end gap-3 whitespace-nowrap">
          {producto.activo ? (
            <Link
              href={`/producto/${producto.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-muted hover:text-accent transition-colors"
            >
              Ver
            </Link>
          ) : (
            <span
              className="text-on-surface-muted/40 cursor-not-allowed"
              title="Inactivo — no tiene página pública"
            >
              Ver
            </span>
          )}
          <Link
            href={`/admin/productos/${producto.id}`}
            className="text-on-surface hover:text-accent transition-colors"
          >
            Editar
          </Link>
          <BotonEliminar id={producto.id} nombre={producto.nombre} />
        </div>
      </td>
    </tr>
  );
}

export default function ProductosOrdenables({ productosIniciales }: { productosIniciales: Producto[] }) {
  const [productos, setProductos] = useState(productosIniciales);
  // El redirect() que hacen crear/editar/eliminar (app/admin/productos/actions.ts)
  // es una navegación "soft" a la misma ruta: el Server Component vuelve a
  // correr con datos frescos, pero este Client Component NO se remonta, así
  // que el useState de arriba se queda con el snapshot viejo para siempre —
  // un producto borrado seguía apareciendo en la tabla (y su id viajaba en
  // el próximo reorden, tirando abajo la transacción entera en Prisma). Este
  // efecto resincroniza cada vez que el server manda props nuevas.
  useEffect(() => {
    setProductos(productosIniciales);
  }, [productosIniciales]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [, startTransition] = useTransition();

  const categorias = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const p of productosIniciales) mapa.set(p.categoriaId, p.categoria.nombre);
    return Array.from(mapa.entries());
  }, [productosIniciales]);

  const hayFiltro = busqueda.trim() !== "" || categoriaFiltro !== "";
  const arrastreHabilitado = !hayFiltro;
  const cantidadDestacados = useMemo(() => productos.filter((p) => p.destacado).length, [productos]);

  const [stockPendiente, setStockPendiente] = useState<StockPendiente>({});
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [mensajeStock, setMensajeStock] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const cantidadProductosConCambios = Object.keys(stockPendiente).length;

  // Aviso nativo del navegador si intentan cerrar/recargar con stock sin
  // guardar — la barra flotante ya lo deja claro dentro de la página, pero
  // un cierre accidental de pestaña no pasa por ahí.
  useEffect(() => {
    if (cantidadProductosConCambios === 0) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [cantidadProductosConCambios]);

  function handleCambiarStock(id: string, ml: number, valor: number) {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;
    const original = producto.stock[String(ml)] ?? 0;
    setMensajeStock(null);
    setStockPendiente((prev) => {
      const deProducto = { ...(prev[id] ?? {}) };
      if (valor === original) {
        delete deProducto[String(ml)];
      } else {
        deProducto[String(ml)] = valor;
      }
      const next = { ...prev };
      if (Object.keys(deProducto).length === 0) {
        delete next[id];
      } else {
        next[id] = deProducto;
      }
      return next;
    });
  }

  function handleDescartarStock() {
    setStockPendiente({});
    setMensajeStock(null);
  }

  // El "Stock guardado." es un aviso de un instante, no algo que deba
  // quedarse pegado en pantalla — se retira solo. El de error se queda
  // hasta que reintenten o descarten, porque todavía hay cambios sin
  // persistir.
  useEffect(() => {
    if (mensajeStock?.tipo !== "ok") return;
    const t = setTimeout(() => setMensajeStock(null), 3000);
    return () => clearTimeout(t);
  }, [mensajeStock]);

  async function handleGuardarStock() {
    const cambios = Object.entries(stockPendiente).map(([id, deProducto]) => {
      const producto = productos.find((p) => p.id === id)!;
      return { id, slug: producto.slug, stock: { ...producto.stock, ...deProducto } };
    });
    if (cambios.length === 0) return;

    setGuardandoStock(true);
    setMensajeStock(null);
    try {
      const res = await actualizarStockAction(cambios);
      if (res.error) {
        setMensajeStock({ tipo: "error", texto: res.error });
        return;
      }
      setProductos((prev) =>
        prev.map((p) => {
          const cambio = cambios.find((c) => c.id === p.id);
          return cambio ? { ...p, stock: cambio.stock } : p;
        })
      );
      setStockPendiente({});
      setMensajeStock({ tipo: "ok", texto: "Stock guardado." });
    } catch {
      setMensajeStock({ tipo: "error", texto: "No se pudo guardar el stock — probá de nuevo." });
    } finally {
      setGuardandoStock(false);
    }
  }

  function handleToggleDestacado(id: string) {
    // Optimista, igual que el reorden — si la Server Action falla o rechaza
    // por el tope de destacados, se revierte y se avisa por qué.
    const anterior = productos;
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, destacado: !p.destacado } : p))
    );
    startTransition(() => {
      toggleProductoDestacadoAction(id)
        .then((res) => {
          if (res.error) {
            setProductos(anterior);
            alert(res.error);
          }
        })
        .catch(() => {
          setProductos(anterior);
          alert("No se pudo actualizar destacado — se deshizo el cambio. Probá de nuevo.");
        });
    });
  }

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (categoriaFiltro && p.categoriaId !== categoriaFiltro) return false;
      if (termino && !p.nombre.toLowerCase().includes(termino)) return false;
      return true;
    });
  }, [productos, busqueda, categoriaFiltro]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(e: DragEndEvent) {
    if (!arrastreHabilitado) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // El efecto secundario va afuera del updater de setProductos — un
    // updater tiene que ser puro, y React puede invocarlo más de una vez
    // (StrictMode en dev). Antes la Server Action se llamaba sin await ni
    // catch: si fallaba (red caída, un id ya borrado por otra pestaña), el
    // admin veía el orden nuevo en pantalla pero nunca se guardaba, sin
    // ningún aviso. Ahora se revierte el estado optimista y se avisa.
    const anterior = productos;
    const oldIndex = productos.findIndex((p) => p.id === active.id);
    const newIndex = productos.findIndex((p) => p.id === over.id);
    const reordenado = arrayMove(productos, oldIndex, newIndex);
    setProductos(reordenado);

    startTransition(() => {
      reordenarProductosAction(reordenado.map((p) => p.id)).catch(() => {
        setProductos(anterior);
        alert("No se pudo guardar el nuevo orden — se deshizo el cambio. Probá de nuevo.");
      });
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          className="campo-admin sm:max-w-xs"
          aria-label="Buscar producto por nombre"
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="campo-admin sm:max-w-xs"
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(([id, nombre]) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
        <p className="text-sm text-on-surface-muted sm:ml-auto self-center whitespace-nowrap">
          {filtrados.length} de {productos.length} ·{" "}
          <span className={cantidadDestacados >= MAX_DESTACADOS ? "text-error" : "text-warning"}>
            ★ {cantidadDestacados}/{MAX_DESTACADOS} destacados
          </span>
        </p>
      </div>

      {hayFiltro && (
        <p className="text-xs text-on-surface-muted mb-3">
          Limpiá la búsqueda y el filtro de categoría para poder reordenar por arrastre.
        </p>
      )}

      {/* DndContext va afuera del <table>, no adentro: el div oculto que
          agrega para accesibilidad (descripción del drag) tiene que caer
          como hermano del <table>, no como hijo directo — un <div> ahí
          rompe la validación de HTML y dispara un mismatch de hidratación. */}
      <DndContext
        id="productos-ordenables"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-on-surface-muted border-b border-border-subtle">
                <th className="py-3 pr-2" aria-hidden="true"></th>
                <th className="py-3 pr-2" aria-hidden="true"></th>
                <th className="py-3 pr-4" aria-hidden="true"></th>
                <th className="py-3 pr-4">Nombre</th>
                <th className="py-3 pr-4">Categoría</th>
                <th className="py-3 pr-4">Tipo</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4">Desde</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <SortableContext items={filtrados.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {filtrados.map((producto) => (
                  <Fila
                    key={producto.id}
                    producto={producto}
                    arrastreHabilitado={arrastreHabilitado}
                    onToggleDestacado={handleToggleDestacado}
                    cambiosStock={stockPendiente[producto.id]}
                    onCambiarStock={handleCambiarStock}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>

          {filtrados.length === 0 && (
            <p className="py-10 text-center text-on-surface-muted">
              No hay productos que coincidan con la búsqueda.
            </p>
          )}
        </div>
      </DndContext>

      {/* Barra flotante de guardar stock — se queda pegada al fondo mientras
          haya cambios sin guardar (o mientras dure el aviso de resultado),
          para que nunca sea ambiguo si lo editado ya quedó persistido. */}
      {(cantidadProductosConCambios > 0 || mensajeStock) && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-border-subtle bg-surface-raised shadow-[0_-4px_16px_rgba(0,0,0,0.15)]"
        >
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              {cantidadProductosConCambios > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-warning shrink-0" aria-hidden="true" />
                  <span className="text-on-background">
                    {cantidadProductosConCambios === 1
                      ? "1 producto con stock sin guardar"
                      : `${cantidadProductosConCambios} productos con stock sin guardar`}
                  </span>
                </>
              ) : (
                mensajeStock?.tipo === "ok" && (
                  <span className="text-success">✓ {mensajeStock.texto}</span>
                )
              )}
              {mensajeStock?.tipo === "error" && (
                <span className="text-error">{mensajeStock.texto}</span>
              )}
            </div>
            {cantidadProductosConCambios > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDescartarStock}
                  disabled={guardandoStock}
                  className="text-sm text-on-surface-muted hover:text-on-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarStock}
                  disabled={guardandoStock}
                  className="bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-6 py-3 hover:bg-[#E8E8E8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {guardandoStock ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Espaciador para que la barra flotante no tape la última fila de la
          tabla cuando hay cambios sin guardar. */}
      {(cantidadProductosConCambios > 0 || mensajeStock) && <div className="h-20" aria-hidden="true" />}
    </div>
  );
}
