import { formatoPrecio } from "@/lib/formato";

export default function PrecioBloque({
  precio,
  sena,
}: {
  precio: number;
  sena: number | null;
}) {
  return (
    <div>
      <p className="font-display text-4xl text-primary">{formatoPrecio(precio)}</p>
      {sena != null && (
        <p className="mt-2 text-sm text-on-surface-muted">
          Seña para pedir:{" "}
          <span className="text-accent font-semibold">{formatoPrecio(sena)}</span>{" "}
          (50% del total — producto por encargo)
        </p>
      )}
    </div>
  );
}
