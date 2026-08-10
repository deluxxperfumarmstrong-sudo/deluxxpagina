import { create } from "zustand";

// Estado de la vista previa del carrito (drawer) — separado del store de
// datos (carrito.ts) porque es UI efímera, no debe persistir en localStorage.
type CarritoUIState = {
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  // El drawer completo solo se abre solo con el primer ítem del carrito
  // (ver ProductCard/FichaProducto) — interrumpir con el mismo panel grande
  // cada vez que el cliente sigue agregando productos sería invasivo. De ahí
  // en más, cada "agregar" dispara este toast liviano en su lugar.
  toastVisible: boolean;
  mostrarToast: () => void;
  ocultarToast: () => void;
};

export const useCarritoUI = create<CarritoUIState>((set) => ({
  abierto: false,
  abrir: () => set({ abierto: true, toastVisible: false }),
  cerrar: () => set({ abierto: false }),
  toastVisible: false,
  mostrarToast: () => set({ toastVisible: true }),
  ocultarToast: () => set({ toastVisible: false }),
}));
