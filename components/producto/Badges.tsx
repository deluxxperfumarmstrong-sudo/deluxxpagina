import type { TipoProducto } from "@/lib/types";

export function BadgeTipo({ tipo }: { tipo: TipoProducto }) {
  return (
    <span className="chip-tag uppercase">
      {tipo === "ENCARGO" ? "Por encargo" : "En stock"}
    </span>
  );
}

export function BadgeMuestra() {
  return (
    <span className="chip-tag uppercase text-accent-text border border-accent-text">
      Muestra disponible
    </span>
  );
}
