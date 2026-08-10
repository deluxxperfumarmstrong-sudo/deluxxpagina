import type { Producto } from "@/lib/types";

// ENCARGO se fabrica a pedido — no tiene un límite físico real, así que no
// se acota por stock aunque el campo tenga datos (regla 3: nunca lleva seña
// tampoco, ver calcularSena).
export function limitaPorStock(producto: Pick<Producto, "tipo">): boolean {
  return producto.tipo === "STOCK";
}

export function stockPorMl(producto: Pick<Producto, "stock">, ml: number): number {
  return producto.stock[String(ml)] ?? 0;
}

export function hayStock(producto: Pick<Producto, "tipo" | "stock">, ml: number): boolean {
  if (!limitaPorStock(producto)) return true;
  return stockPorMl(producto, ml) > 0;
}
