import type { Producto } from "@/lib/types";

export function precioPorMl(producto: Pick<Producto, "precios">, ml: number): number {
  return producto.precios[String(ml)] ?? 0;
}

export function precioDesde(producto: Pick<Producto, "precios">): number {
  const valores = Object.values(producto.precios);
  return valores.length ? Math.min(...valores) : 0;
}

// Regla 2: seña = mitad del precio del tamaño elegido. Solo aplica a ENCARGO
// (regla 3: STOCK nunca muestra seña).
export function calcularSena(producto: Pick<Producto, "tipo" | "precios">, ml: number): number | null {
  if (producto.tipo !== "ENCARGO") return null;
  return Math.round(precioPorMl(producto, ml) / 2);
}
