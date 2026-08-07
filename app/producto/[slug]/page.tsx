import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductoBySlug } from "@/lib/data";
import GaleriaProducto from "@/components/producto/GaleriaProducto";
import FichaProducto from "@/components/producto/FichaProducto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) return {};
  return {
    title: producto.nombre,
    description: producto.descripcion ?? `${producto.nombre} — ${producto.categoria.nombre}.`,
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion ?? undefined,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-12 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />
        <FichaProducto producto={producto} />
      </div>
    </div>
  );
}
