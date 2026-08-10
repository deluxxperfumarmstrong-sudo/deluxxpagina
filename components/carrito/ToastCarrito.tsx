"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCarritoUI } from "@/lib/store/carritoUI";

const DURACION_MS = 5000;

// Feedback de "agregaste otro producto" para la segunda compra en adelante
// — el drawer completo (DrawerCarrito) ya cumplió ese rol para el primer
// ítem, así que acá alcanza con un aviso chico que no interrumpe la compra.
export default function ToastCarrito() {
  const visible = useCarritoUI((s) => s.toastVisible);
  const ocultar = useCarritoUI((s) => s.ocultarToast);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(ocultar, DURACION_MS);
    return () => clearTimeout(t);
  }, [visible, ocultar]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md flex items-center justify-center flex-wrap gap-x-3 gap-y-1 bg-surface-raised border border-border-subtle rounded-sm shadow-2xl px-5 py-3 text-center"
    >
      <span className="text-success shrink-0" aria-hidden="true">
        ✓
      </span>
      <p className="text-sm text-on-surface">Agregaste un producto al carrito</p>
      <Link
        href="/carrito"
        onClick={ocultar}
        className="text-sm font-semibold text-accent-text hover:underline shrink-0"
      >
        Ver carrito
      </Link>
    </div>
  );
}
