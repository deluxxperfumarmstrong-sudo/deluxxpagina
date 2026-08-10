export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-12 py-12 md:py-16">
      <div className="h-10 w-48 bg-surface animate-pulse mb-2" />
      <div className="h-4 w-24 bg-surface animate-pulse mb-6" />
      {/* mismas columnas que GrillaProductos.tsx (2/3) — si no coinciden,
          la grilla "salta" apenas llegan los productos reales. */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-sm p-4">
            <div className="aspect-[3/4] bg-surface-metallic/30 animate-pulse mb-4" />
            <div className="h-3 w-20 bg-surface-metallic/30 animate-pulse mb-2" />
            <div className="h-5 w-32 bg-surface-metallic/30 animate-pulse mb-2" />
            <div className="h-4 w-24 bg-surface-metallic/30 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
