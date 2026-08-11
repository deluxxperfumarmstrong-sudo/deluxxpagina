"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MENSAJES: Record<string, string> = {
  creado: "Producto creado.",
  actualizado: "Cambios guardados.",
  eliminado: "Producto eliminado.",
};

const DURACION_MS = 4000;

// Feedback de éxito para crear/editar/eliminar en /admin/productos. Esas
// tres acciones terminan en un redirect() de servidor (navegación completa),
// así que no hay estado de cliente que sobreviva al viaje — el resultado se
// pasa por query param (?ok=creado) y este componente lo lee al montar,
// muestra el aviso y limpia el param para que un refresh no lo repita.
export default function ToastAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ok = searchParams.get("ok");
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (!ok) return;
    setMensaje(MENSAJES[ok] ?? null);
    const params = new URLSearchParams(searchParams);
    params.delete("ok");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Solo debe correr cuando cambia el param leído de la URL, no cuando
    // router/pathname/searchParams cambian de identidad en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), DURACION_MS);
    return () => clearTimeout(t);
  }, [mensaje]);

  if (!mensaje) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md flex items-center justify-center gap-3 bg-surface-raised border border-border-subtle rounded-sm shadow-2xl px-5 py-3 text-center"
    >
      <span className="text-success shrink-0" aria-hidden="true">
        ✓
      </span>
      <p className="text-sm text-on-surface">{mensaje}</p>
    </div>
  );
}
