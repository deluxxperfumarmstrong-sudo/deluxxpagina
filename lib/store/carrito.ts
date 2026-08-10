import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TipoProducto } from "@/lib/types";

export type ItemCarrito = {
  // Línea = producto + tamaño. El mismo perfume en 50ml y 100ml son dos líneas.
  productoSlug: string;
  nombre: string;
  imagen: string | undefined;
  categoriaNombre: string;
  tipo: TipoProducto;
  ml: number;
  precioUnitario: number;
  cantidad: number;
  tieneSena: boolean;
  senaUnitaria: number;
  // Tope de stock para este tamaño al momento de agregarlo — `null` cuando
  // no aplica (ENCARGO, ver lib/stock.ts). Se congela en el ítem porque el
  // carrito no vuelve a consultar el producto una vez agregado.
  stockMaximo: number | null;
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
          const tope = item.stockMaximo;
          const existente = state.items.find((i) => mismaLinea(i, item));
          if (existente) {
            return {
              items: state.items.map((i) => {
                if (!mismaLinea(i, item)) return i;
                const cantidadNueva = i.cantidad + cantidad;
                return {
                  // `...item` pisa a `...i`: si no, una línea que ya estaba en
                  // el carrito conserva para siempre los datos con los que se
                  // agregó la primera vez (precio viejo, y sin `imagen` si
                  // venía de un localStorage anterior a que ese campo existiera).
                  ...i,
                  ...item,
                  cantidad: tope != null ? Math.min(cantidadNueva, tope) : cantidadNueva,
                };
              }),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, cantidad: tope != null ? Math.min(cantidad, tope) : cantidad },
            ],
          };
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
                  mismaLinea(i, { productoSlug, ml })
                    ? { ...i, cantidad: i.stockMaximo != null ? Math.min(cantidad, i.stockMaximo) : cantidad }
                    : i
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

  // Regla 2: los ítems por encargo se pagan con seña ahora + el resto
  // cuando llega el pedido. Los ítems en stock se pagan completos ahora.
  const stockTotal = items.reduce(
    (acc, i) => acc + (i.tipo === "STOCK" ? i.precioUnitario * i.cantidad : 0),
    0
  );
  const encargoTotal = items.reduce(
    (acc, i) => acc + (i.tipo === "ENCARGO" ? i.precioUnitario * i.cantidad : 0),
    0
  );
  const hayEncargo = items.some((i) => i.tieneSena);
  const aAbonarAhora = stockTotal + senaTotal;
  const restaPagar = encargoTotal - senaTotal;

  return {
    subtotal,
    senaTotal,
    cantidadItems,
    stockTotal,
    encargoTotal,
    hayEncargo,
    aAbonarAhora,
    restaPagar,
  };
}
