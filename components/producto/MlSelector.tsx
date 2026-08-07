export default function MlSelector({
  opciones,
  seleccionado,
  onSeleccionar,
}: {
  opciones: number[];
  seleccionado: number;
  onSeleccionar: (ml: number) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-2">
        Tamaño
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tamaño en mililitros">
        {opciones.map((ml) => {
          const activo = ml === seleccionado;
          return (
            <button
              key={ml}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onSeleccionar(ml)}
              className={`px-4 py-2 text-sm border transition-colors ${
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
