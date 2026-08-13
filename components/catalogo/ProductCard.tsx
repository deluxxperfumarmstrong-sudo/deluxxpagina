"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Producto } from "@/lib/types";
import { precioPorMl, precioListaPorMl, porcentajeDescuento, calcularSena } from "@/lib/precio";
import { limitaPorStock, stockPorMl } from "@/lib/stock";
import { formatoPrecio } from "@/lib/formato";
import ImagenProducto from "@/components/ui/ImagenProducto";
import { useCarrito } from "@/lib/store/carrito";
import { useCarritoUI } from "@/lib/store/carritoUI";
import { BadgeTipo, BadgeMuestra } from "@/components/producto/Badges";

export default function ProductCard({ producto }: { producto: Producto }) {
  const mililitrosOrdenados = useMemo(
    () => [...producto.mililitros].sort((a, b) => a - b),
    [producto.mililitros]
  );
  const [ml, setMl] = useState(
    () =>
      mililitrosOrdenados.find((m) => !limitaPorStock(producto) || stockPorMl(producto, m) > 0) ??
      mililitrosOrdenados[0]
  );
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

  function handleAgregar() {
    if (sinStock) return;
    const carritoEstabaVacio = useCarrito.getState().items.length === 0;
    agregarItem({
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
    });
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
    <div className="group h-full flex flex-col bg-surface rounded-sm p-2 sm:p-4 md:p-5 hover:bg-surface-raised transition-[background-color,transform] duration-200 hover:scale-[1.02] active:scale-[1.02] will-change-transform">
      <Link href={`/producto/${producto.slug}`} className="block">
        <div className="relative aspect-square mb-2 sm:mb-4 overflow-hidden">
          <ImagenProducto
            publicId={producto.imagenes[0]}
            nombre={producto.nombre}
            className="absolute inset-0"
            // El ancho declarado acá es lo que decide qué archivo le pide el
            // navegador a Cloudinary, y estaba muy por encima del real: decía
            // 90vw cuando la grilla es de 2 columnas (grid-cols-2), o sea
            // ~42vw en un celular de 390 px. Medido contra la cuenta real: en
            // un Android con DPR 3 eso hacía pedir el archivo de 1080 px
            // (222 KB) en vez del de 640 (85 KB) — 2,6x de más por cada
            // tarjeta, en la página que más imágenes carga de todo el sitio.
            // Los valores de ahora salen del layout: 2 columnas hasta 768 px
            // y 3 en adelante, con el contenedor topeado en max-w-7xl.
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 28vw"
          />
          {/* Apiladas en la misma esquina, no una en cada punta: en una
              tarjeta de ~150px (grilla de 2 columnas en mobile) "Pedido" +
              "-20%" repartidas a izquierda y derecha se superponen igual
              aunque cada una sea corta — medido con canvas.measureText, no
              a ojo. Apiladas, cada chip solo compite por el ancho completo
              de la imagen consigo misma. */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            <BadgeTipo tipo={producto.tipo} compacto />
            {porcentajeOff != null && (
              <span className="chip-tag !text-xs !px-2 !py-1 bg-error text-on-primary uppercase whitespace-nowrap">
                -{porcentajeOff}%
              </span>
            )}
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">
          {producto.categoria.nombre}
        </p>
        <h3 className="font-display text-xl md:text-2xl text-on-surface leading-tight group-hover:text-accent transition-colors">
          {producto.nombre}
        </h3>
      </Link>

      {/* La imagen es chica en mobile (grilla de 2 columnas) — dos chips
          arriba ya la ocupaban a la mitad y "Muestra disponible" se
          truncaba. Se movió acá, debajo del título, donde entra el texto
          completo y no compite por espacio con el tipo/descuento.
          Siempre se renderiza (con "invisible" si no aplica) en vez de
          condicionar el bloque entero: dos tarjetas vecinas en la misma
          fila de la grilla, una con muestra y otra sin, quedaban con la
          fila de precio/Agregar a distinta altura porque a una le faltaba
          este renglón. "invisible" reserva el mismo espacio sin mostrar
          nada, así el precio siempre cae en la misma línea. */}
      <div className="mt-2 mb-1">
        <BadgeMuestra compacto className={producto.tieneMuestra ? "" : "invisible"} />
      </div>

      {/* length > 0, no > 1: antes un producto/kit con un solo tamaño
          quedaba sin ninguna indicación de tamaño en la tarjeta (la
          condición pedía más de uno para mostrar el selector). Ahora
          siempre se ve — con un solo tamaño, el "radiogroup" tiene un solo
          botón, ya marcado como activo, que no hace nada al clickear (no
          hay otra opción a la que cambiar), pero deja claro cuál es. */}
      {mililitrosOrdenados.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3" role="radiogroup" aria-label="Tamaño en mililitros">
          {mililitrosOrdenados.map((opcion) => {
            const activo = opcion === ml;
            const agotado = stockLimita && stockPorMl(producto, opcion) <= 0;
            return (
              <button
                key={opcion}
                type="button"
                role="radio"
                aria-checked={activo}
                disabled={agotado}
                title={agotado ? `${opcion}ml sin stock` : undefined}
                onClick={() => setMl(opcion)}
                className={`shrink-0 h-[32px] px-3 text-xs leading-none rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  activo
                    ? "border-primary bg-primary text-on-primary"
                    : "border-border text-on-surface-muted hover:border-primary"
                }`}
              >
                {opcion} ml
              </button>
            );
          })}
        </div>
      )}

      {/* mt-auto: el contenedor raíz de la tarjeta ahora es h-full flex
          flex-col (para estirarse parejo con sus vecinas de la misma fila
          de la grilla — comportamiento por defecto de CSS grid). Sin
          mt-auto acá, dos tarjetas con distinta cantidad de líneas en el
          título (2 vs 3) o de tamaños (uno vs dos) dejaban el espacio
          "de más" como aire suelto al final de la tarjeta más corta, y el
          precio/Agregar quedaba a distinta altura entre columnas — con
          mt-auto, este bloque se pega siempre al piso de la tarjeta,
          parejo en toda la fila. */}
      <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <p className="font-[var(--font-body)] font-semibold text-primary text-lg md:text-xl">
          {porcentajeOff != null && (
            <span className="text-on-surface-muted font-normal text-sm line-through mr-2">
              {formatoPrecio(precioOriginal)}
            </span>
          )}
          {formatoPrecio(precio)}
        </p>
        <button
          type="button"
          onClick={handleAgregar}
          disabled={sinStock}
          className={`min-h-11 w-full sm:w-auto px-4 font-[var(--font-body)] font-semibold text-xs uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            agregado
              ? "bg-success text-on-primary"
              : "bg-primary text-on-primary hover:bg-[#E8E8E8]"
          }`}
        >
          {agregado ? "Agregado ✓" : sinStock ? "Sin stock" : "Agregar"}
        </button>
      </div>
    </div>
  );
}
