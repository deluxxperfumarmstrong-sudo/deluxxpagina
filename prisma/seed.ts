import { PrismaClient } from "@prisma/client";
import { generarCatalogoMock } from "../lib/mock/generar-productos";
import { validarCoherenciaPreciosMl, validarCoherenciaStockMl } from "../lib/validacion";

const prisma = new PrismaClient();

async function main() {
  const { categorias, productos } = generarCatalogoMock();

  // Falla ruidosa antes de tocar la base si algún producto tiene un tamaño
  // sin precio (o un precio sin tamaño).
  for (const producto of productos) {
    validarCoherenciaPreciosMl(producto);
    validarCoherenciaStockMl(producto);
  }

  console.log(`Sembrando ${categorias.length} categorías y ${productos.length} productos...`);

  const idPorSlug = new Map<string, string>();
  for (const cat of categorias) {
    const creada = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      // `orden` NO va acá: es curación manual del admin (arrastre en
      // /admin/categorias). Volver a correr el seed no debería revertirla —
      // solo se setea en `create`, para una categoría nueva.
      update: {
        nombre: cat.nombre,
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
      // `destacado` y `orden` NO van en `update`: son curación manual hecha
      // desde el admin (checkbox "Destacado" y arrastre en
      // /admin/productos). Antes se pisaban en cada re-corrida del seed
      // (paso documentado de deploy) sin ningún aviso — solo tienen sentido
      // como valor inicial en `create`, para un producto que recién se siembra.
      update: {
        nombre: p.nombre,
        descripcion: p.descripcion,
        notas: p.notas,
        tipo: p.tipo,
        precios: p.precios,
        preciosDescuento: p.preciosDescuento,
        mililitros: p.mililitros,
        stock: p.stock,
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
        preciosDescuento: p.preciosDescuento,
        mililitros: p.mililitros,
        stock: p.stock,
        imagenes: p.imagenes,
        tieneMuestra: p.tieneMuestra,
        activo: p.activo,
        destacado: p.destacado,
        orden: p.orden,
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
