export default function MlSelector({
  opciones,
  seleccionado,
  onSeleccionar,
  stockPorMl,
}: {
  opciones: number[];
  seleccionado: number;
  onSeleccionar: (ml: number) => void;
  // Cuando se pasa, un tamaño con 0 queda deshabilitado — se omite para
  // productos ENCARGO, que no tienen límite físico (ver FichaProducto).
  stockPorMl?: Record<string, number>;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-2">
        Tamaño
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tamaño en mililitros">
        {opciones.map((ml) => {
          const activo = ml === seleccionado;
          const agotado = stockPorMl != null && (stockPorMl[String(ml)] ?? 0) <= 0;
          return (
            <button
              key={ml}
              type="button"
              role="radio"
              aria-checked={activo}
              disabled={agotado}
              title={agotado ? `${ml}ml sin stock` : undefined}
              onClick={() => onSeleccionar(ml)}
              className={`min-h-11 px-4 py-2 text-sm rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                activo
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border text-on-surface hover:border-primary"
              }`}
            >
              {ml} ml
            </button>
          );
        })}
      </div>
    </div>
  );
}
