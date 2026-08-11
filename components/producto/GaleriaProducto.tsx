import ImagenProducto from "@/components/ui/ImagenProducto";

// Desktop: sigue siendo la primera foto grande + la segunda al lado (como
// antes). Mobile: en vez de mostrar solo la primera foto y ocultar el resto
// hasta md:, arma un mosaico con TODAS las fotos cargadas — la primera
// grande arriba, las demás en una fila de miniaturas cuadradas debajo,
// aprovechando fotos que antes quedaban sin mostrarse en mobile.
export default function GaleriaProducto({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [foto1, foto2, ...resto] = imagenes;

  return (
    <div>
      {/* Mobile: mosaico */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="relative aspect-[4/5]">
          <ImagenProducto publicId={foto1} nombre={nombre} className="absolute inset-0" sizes="100vw" />
        </div>
        {imagenes.length > 1 && (
          <div className="grid grid-cols-3 gap-3">
            {[foto2, ...resto].filter(Boolean).map((publicId, i) => (
              <div key={`${publicId}-${i}`} className="relative aspect-square">
                <ImagenProducto
                  publicId={publicId}
                  nombre={nombre}
                  className="absolute inset-0"
                  sizes="33vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: dos columnas como antes */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        <div className="relative aspect-[3/4]">
          <ImagenProducto publicId={foto1} nombre={nombre} className="absolute inset-0" sizes="50vw" />
        </div>
        <div className="relative aspect-[3/4]">
          <ImagenProducto publicId={foto2} nombre={nombre} className="absolute inset-0" sizes="50vw" />
        </div>
      </div>
    </div>
  );
}
