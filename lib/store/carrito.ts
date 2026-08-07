import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TipoProducto } from "@/lib/types";

export type ItemCarrito = {
  // Línea = producto + tamaño. El mismo perfume en 50ml y 100ml son dos líneas.
  productoSlug: string;
  nombre: string;
  categoriaNombre: string;
  tipo: TipoProducto;
  ml: number;
  precioUnitario: number;
  cantidad: number;
  tieneSena: boolean;
  senaUnitaria: number;
};

type CarritoState = {
  items: ItemCarrito[];
  agregarItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  quitarItem: (productoSlug: string, ml: number) => void;
  actualizarCantidad: (productoSlug: string, ml: number, cantidad: number) => void;
  vaciar: () => void;
};

function mismaLinea(a: { productoSlug: string; ml: number }, b: { productoSlug: string; ml: number }) {
  return a.productoSlug === b.productoSlug && a.ml === b.ml;
}

export const useCarrito = create<CarritoState>()(
  persist(
    (set) => ({
      items: [],
      agregarItem: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => mismaLinea(i, item));
          if (existente) {
            return {
              items: state.items.map((i) =>
                mismaLinea(i, item) ? { ...i, cantidad: i.cantidad + cantidad } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, cantidad }] };
        }),
      quitarItem: (productoSlug, ml) =>
        set((state) => ({
          items: state.items.filter((i) => !mismaLinea(i, { productoSlug, ml })),
        })),
      actualizarCantidad: (productoSlug, ml, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((i) => !mismaLinea(i, { productoSlug, ml }))
              : state.items.map((i) =>
                  mismaLinea(i, { productoSlug, ml }) ? { ...i, cantidad } : i
                ),
        })),
      vaciar: () => set({ items: [] }),
    }),
    { name: "deluxx-carrito" }
  )
);

export function totalesCarrito(items: ItemCarrito[]) {
  const subtotal = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  const senaTotal = items.reduce(
    (acc, i) => acc + (i.tieneSena ? i.senaUnitaria * i.cantidad : 0),
    0
  );
  const cantidadItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  return { subtotal, senaTotal, cantidadItems };
}
