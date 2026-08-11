import { formatoPrecio } from "@/lib/formato";

export default function PrecioBloque({
  precio,
  precioOriginal,
  porcentajeOff,
  sena,
}: {
  precio: number;
  precioOriginal?: number | null;
  porcentajeOff?: number | null;
  sena: number | null;
}) {
  const hayDescuento = precioOriginal != null && porcentajeOff != null;
  return (
    <div>
      {hayDescuento && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-on-surface-muted line-through">{formatoPrecio(precioOriginal)}</span>
          <span className="chip-tag bg-error text-on-primary uppercase text-xs">
            -{porcentajeOff}%
          </span>
        </div>
      )}
      <p className="font-display text-4xl text-primary">{formatoPrecio(precio)}</p>
      {sena != null && (
        <p className="mt-2 text-sm text-on-surface-muted">
          Seña para pedir:{" "}
          <span className="text-accent-text font-semibold">{formatoPrecio(sena)}</span>{" "}
          (50% del total — producto por pedido)
        </p>
      )}
    </div>
  );
}
