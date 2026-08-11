import type { TipoProducto } from "@/lib/types";

// `compacto` es para las tarjetas del catálogo (grilla de 2 columnas en
// mobile, ~150px de ancho) — el texto completo "Por pedido"/"Muestra
// disponible" en mayúsculas no entra en una sola línea ahí. La ficha de
// producto individual tiene todo el ancho de la página, así que se queda
// con las etiquetas completas por defecto.
export function BadgeTipo({ tipo, compacto = false }: { tipo: TipoProducto; compacto?: boolean }) {
  return (
    <span className={`chip-tag uppercase whitespace-nowrap ${compacto ? "!px-2.5 !py-1" : ""}`}>
      {compacto ? (tipo === "ENCARGO" ? "Pedido" : "Stock") : tipo === "ENCARGO" ? "Por pedido" : "En stock"}
    </span>
  );
}

export function BadgeMuestra({
  compacto = false,
  className = "",
}: {
  compacto?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`chip-tag text-accent-text border border-accent-text whitespace-nowrap ${
        compacto ? "normal-case !text-xs !tracking-tight !px-2 !py-1" : "uppercase"
      } ${className}`}
    >
      Muestra disponible
    </span>
  );
}
