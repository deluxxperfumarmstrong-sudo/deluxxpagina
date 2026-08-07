import ImagenProducto from "@/components/ui/ImagenProducto";

export default function GaleriaProducto({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [foto1, foto2] = imagenes;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative aspect-[3/4] col-span-2 md:col-span-1">
        <ImagenProducto publicId={foto1} nombre={nombre} className="absolute inset-0" sizes="50vw" />
      </div>
      <div className="relative aspect-[3/4] hidden md:block">
        <ImagenProducto publicId={foto2} nombre={nombre} className="absolute inset-0" sizes="50vw" />
      </div>
    </div>
  );
}
