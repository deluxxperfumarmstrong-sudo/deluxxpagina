import type { Producto } from "@/lib/types";

type ConPrecios = Pick<Producto, "precios" | "preciosDescuento">;

export function precioListaPorMl(producto: Pick<Producto, "precios">, ml: number): number {
  return producto.precios[String(ml)] ?? 0;
}

// Un ml sin entrada en `preciosDescuento`, o con un valor que no mejora el
// precio de lista, no tiene descuento — no es un error, es el caso normal.
export function precioOfertaPorMl(producto: ConPrecios, ml: number): number | null {
  const oferta = producto.preciosDescuento[String(ml)];
  if (typeof oferta !== "number" || oferta <= 0) return null;
  return oferta < precioListaPorMl(producto, ml) ? oferta : null;
}

export function tieneDescuento(producto: ConPrecios, ml: number): boolean {
  return precioOfertaPorMl(producto, ml) != null;
}

// Porcentaje redondeado, ej. 25 para "25% OFF".
export function porcentajeDescuento(producto: ConPrecios, ml: number): number | null {
  const oferta = precioOfertaPorMl(producto, ml);
  if (oferta == null) return null;
  const lista = precioListaPorMl(producto, ml);
  return Math.round((1 - oferta / lista) * 100);
}

// El precio que realmente se cobra — con descuento si hay uno vigente para
// este tamaño. Todo lo que calcula totales (carrito, seña, "Desde $" del
// catálogo/admin) usa este, no `precioListaPorMl`.
export function precioPorMl(producto: ConPrecios, ml: number): number {
  return precioOfertaPorMl(producto, ml) ?? precioListaPorMl(producto, ml);
}

export function precioDesde(producto: ConPrecios & Pick<Producto, "precios">): number {
  const valores = Object.keys(producto.precios).map((ml) => precioPorMl(producto, Number(ml)));
  return valores.length ? Math.min(...valores) : 0;
}

// Regla 2: seña = mitad del precio del tamaño elegido (ya con descuento si
// aplica). Solo aplica a ENCARGO (regla 3: STOCK nunca muestra seña).
export function calcularSena(producto: Pick<Producto, "tipo"> & ConPrecios, ml: number): number | null {
  if (producto.tipo !== "ENCARGO") return null;
  return Math.round(precioPorMl(producto, ml) / 2);
}
