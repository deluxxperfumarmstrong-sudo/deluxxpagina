import type { TipoProducto } from "@/lib/types";

export function BadgeTipo({ tipo }: { tipo: TipoProducto }) {
  return (
    <span className="inline-block bg-surface-raised text-on-surface-muted text-xs uppercase tracking-wide rounded-full px-3 py-1">
      {tipo === "ENCARGO" ? "Por encargo" : "En stock"}
    </span>
  );
}

export function BadgeMuestra() {
  return (
    <span className="inline-block bg-surface-raised text-accent-text text-xs uppercase tracking-wide rounded-full px-3 py-1 border border-accent-text">
      Muestra disponible
    </span>
  );
}
