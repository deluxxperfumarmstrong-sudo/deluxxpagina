import { PrismaClient } from "@prisma/client";
import { generarCatalogoMock } from "../lib/mock/generar-productos";
import { validarCoherenciaPreciosMl } from "../lib/validacion";

const prisma = new PrismaClient();

async function main() {
  const { categorias, productos } = generarCatalogoMock();

  // Falla ruidosa antes de tocar la base si algún producto tiene un tamaño
  // sin precio (o un precio sin tamaño).
  for (const producto of productos) {
    validarCoherenciaPreciosMl(producto);
  }

  console.log(`Sembrando ${categorias.length} categorías y ${productos.length} productos...`);

  const idPorSlug = new Map<string, string>();
  for (const cat of categorias) {
    const creada = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {
        nombre: cat.nombre,
        orden: cat.orden,
        activa: cat.activa,
      },
      create: {
        nombre: cat.nombre,
        slug: cat.slug,
        orden: cat.orden,
        activa: cat.activa,
      },
    });
    idPorSlug.set(cat.slug, creada.id);
  }

  for (const p of productos) {
    const categoriaId = idPorSlug.get(p.categoria.slug);
    if (!categoriaId) throw new Error(`Categoría no encontrada: ${p.categoria.slug}`);

    await prisma.producto.upsert({
      where: { slug: p.slug },
      update: {
        nombre: p.nombre,
        descripcion: p.descripcion,
        notas: p.notas,
        tipo: p.tipo,
        precios: p.precios,
        mililitros: p.mililitros,
        cantidad: p.cantidad,
        imagenes: p.imagenes,
        tieneMuestra: p.tieneMuestra,
        activo: p.activo,
        categoriaId,
      },
      create: {
        nombre: p.nombre,
        slug: p.slug,
        descripcion: p.descripcion,
        notas: p.notas,
        tipo: p.tipo,
        precios: p.precios,
        mililitros: p.mililitros,
        cantidad: p.cantidad,
        imagenes: p.imagenes,
        tieneMuestra: p.tieneMuestra,
        activo: p.activo,
        categoriaId,
      },
    });
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
