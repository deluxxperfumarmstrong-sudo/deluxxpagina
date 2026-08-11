"use client";

import { useMemo, useState } from "react";
import type { Producto, Genero } from "@/lib/types";
import { precioPorMl, precioListaPorMl, porcentajeDescuento, calcularSena } from "@/lib/precio";
import { limitaPorStock, stockPorMl } from "@/lib/stock";
import { useCarrito } from "@/lib/store/carrito";
import { useCarritoUI } from "@/lib/store/carritoUI";
import { generarLinkMuestraWhatsApp } from "@/lib/whatsapp";
import MlSelector from "./MlSelector";
import PrecioBloque from "./PrecioBloque";
import { BadgeTipo, BadgeMuestra } from "./Badges";
import IconoWhatsapp from "@/components/icons/IconoWhatsapp";

const ETIQUETA_GENERO: Record<Genero, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  UNISEX: "Unisex",
};

// Además de las notas propias del producto (variables), toda la ficha
// promete lo mismo sobre la procedencia — no depende de qué se cargó en el
// admin, así que va fijo acá en vez de ser un campo más por producto.
const CARACTERISTICAS_FIJAS = ["100% original", "Sellado en caja"];

function BloqueNotas({ titulo, notas }: { titulo: string; notas: string[] }) {
  if (notas.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">{titulo}</p>
      <p className="text-on-surface">{notas.join(", ")}</p>
    </div>
  );
}

export default function FichaProducto({ producto }: { producto: Producto }) {
  const mililitrosOrdenados = useMemo(
    () => [...producto.mililitros].sort((a, b) => a - b),
    [producto.mililitros]
  );
  const [ml, setMl] = useState(
    () =>
      mililitrosOrdenados.find((m) => !limitaPorStock(producto) || stockPorMl(producto, m) > 0) ??
      mililitrosOrdenados[0]
  );
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const agregarItem = useCarrito((s) => s.agregarItem);
  const abrirCarrito = useCarritoUI((s) => s.abrir);
  const mostrarToast = useCarritoUI((s) => s.mostrarToast);

  const precio = precioPorMl(producto, ml);
  const precioOriginal = precioListaPorMl(producto, ml);
  const porcentajeOff = porcentajeDescuento(producto, ml);
  const sena = calcularSena(producto, ml);
  const stockLimita = limitaPorStock(producto);
  const stockDisponible = stockPorMl(producto, ml);
  const sinStock = stockLimita && stockDisponible <= 0;
  const cantidadMaxima = stockLimita ? stockDisponible : Infinity;

  function handleSeleccionarMl(nuevoMl: number) {
    setMl(nuevoMl);
    const maximoNuevo = stockLimita ? stockPorMl(producto, nuevoMl) : Infinity;
    setCantidad((c) => Math.max(1, Math.min(c, maximoNuevo)));
  }

  function handleAgregar() {
    if (sinStock) return;
    const carritoEstabaVacio = useCarrito.getState().items.length === 0;
    agregarItem(
      {
        productoSlug: producto.slug,
        nombre: producto.nombre,
        imagen: producto.imagenes[0],
        categoriaNombre: producto.categoria.nombre,
        tipo: producto.tipo,
        ml,
        precioUnitario: precio,
        tieneSena: sena != null,
        senaUnitaria: sena ?? 0,
        stockMaximo: stockLimita ? stockDisponible : null,
      },
      Math.min(cantidad, cantidadMaxima)
    );
    setAgregado(true);
    // La vista previa solo se abre sola con el primer producto del
    // carrito — de ahí en más el cliente sigue comprando sin interrupción,
    // y cada "agregar" siguiente avisa con un toast en vez de reabrir el
    // panel grande (salvo que ya esté abierto, ahí ya se ve reflejado solo).
    if (carritoEstabaVacio) {
      abrirCarrito();
    } else if (!useCarritoUI.getState().abierto) {
      mostrarToast();
    }
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BadgeTipo tipo={producto.tipo} />
        {producto.tieneMuestra && <BadgeMuestra />}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">
          {producto.categoria.nombre} · {ETIQUETA_GENERO[producto.genero]}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-on-background leading-none">
          {producto.nombre}
        </h1>
      </div>

      {(producto.notasSalida.length > 0 ||
        producto.notasCorazon.length > 0 ||
        producto.notasFondo.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BloqueNotas titulo="Notas de salida" notas={producto.notasSalida} />
          <BloqueNotas titulo="Notas de corazón" notas={producto.notasCorazon} />
          <BloqueNotas titulo="Notas de fondo" notas={producto.notasFondo} />
        </div>
      )}

      <MlSelector
        opciones={mililitrosOrdenados}
        seleccionado={ml}
        onSeleccionar={handleSeleccionarMl}
        stockPorMl={stockLimita ? producto.stock : undefined}
      />

      <PrecioBloque
        precio={precio}
        precioOriginal={porcentajeOff != null ? precioOriginal : null}
        porcentajeOff={porcentajeOff}
        sena={sena}
      />

      {stockLimita && (
        <p
          className={`text-xs -mt-4 ${
            sinStock
              ? "text-error"
              : stockDisponible === 1
                ? "text-warning font-semibold"
                : "text-on-surface-muted"
          }`}
        >
          {sinStock
            ? "Sin stock en este tamaño."
            : stockDisponible === 1
              ? `¡Última unidad en ${ml}ml!`
              : `${stockDisponible} disponibles en ${ml}ml.`}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center justify-between sm:justify-start border border-border">
          <button
            type="button"
            aria-label="Restar cantidad"
            disabled={sinStock}
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="w-14 sm:w-11 h-12 text-on-surface hover:text-accent disabled:opacity-30 disabled:hover:text-on-surface"
          >
            −
          </button>
          <span className="w-10 text-center text-on-surface" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            aria-label="Sumar cantidad"
            disabled={sinStock || cantidad >= cantidadMaxima}
            onClick={() => setCantidad((c) => Math.min(c + 1, cantidadMaxima))}
            className="w-14 sm:w-11 h-12 text-on-surface hover:text-accent disabled:opacity-30 disabled:hover:text-on-surface"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAgregar}
          disabled={sinStock}
          className={`sm:flex-1 font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            agregado
              ? "bg-success text-on-primary"
              : "bg-primary text-on-primary hover:bg-[#E8E8E8]"
          }`}
        >
          {agregado ? "Agregado ✓" : sinStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>

      {producto.tieneMuestra && (
        <a
          href={generarLinkMuestraWhatsApp(producto.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-accent-text hover:underline w-fit"
        >
          <IconoWhatsapp className="w-4 h-4" />
          ¿Querés probarla antes? Pedí una muestra por WhatsApp
        </a>
      )}

      {producto.descripcion && (
        <p className="text-on-surface-muted leading-relaxed">{producto.descripcion}</p>
      )}

      <div>
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-2">
          Características
        </p>
        <ul className="flex flex-col gap-1.5">
          {CARACTERISTICAS_FIJAS.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-on-surface">
              <span aria-hidden="true" className="text-accent">
                ✓
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
