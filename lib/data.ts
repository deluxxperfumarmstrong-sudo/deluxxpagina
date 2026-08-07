import { prisma } from "@/lib/prisma";
import { leerCatalogo, guardarCatalogo } from "@/lib/mock/store-file";
import type { Categoria, CatalogoFiltros, Producto } from "@/lib/types";

// Sin DATABASE_URL (Neon aún no conectado — ver docs/BLOQUEOS.md) el sitio
// sirve el catálogo mock. Con DATABASE_URL presente, consulta Neon vía
// Prisma. El resto de la app no necesita saber cuál de los dos está activo.
//
// El mock se lee/escribe siempre desde `lib/mock/store-file.ts` (un JSON en
// `.mock-data/`), NO desde un array en memoria — Next.js puede cargar este
// módulo como instancias separadas entre la capa de Server Actions y la de
// render de páginas (confirmado en desarrollo), así que un array
// module-level no queda compartido de forma confiable entre una mutación y
// la siguiente lectura. El filesystem sí lo es.
const USE_MOCK = !process.env.DATABASE_URL;

function productoActivo(p: Producto) {
  return p.activo;
}

export async function getCategoriasActivas(): Promise<Categoria[]> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const conProductos = new Set(productos.filter(productoActivo).map((p) => p.categoriaId));
    return categorias.filter((c) => c.activa && conProductos.has(c.id)).sort((a, b) => a.orden - b.orden);
  }
  return prisma.categoria.findMany({
    where: { activa: true, productos: { some: { activo: true } } },
    orderBy: { orden: "asc" },
  });
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  if (USE_MOCK) {
    const { categorias } = leerCatalogo();
    return categorias.find((c) => c.slug === slug) ?? null;
  }
  return prisma.categoria.findUnique({ where: { slug } });
}

export async function getProductos(filtros: CatalogoFiltros = {}): Promise<{
  productos: Producto[];
  total: number;
}> {
  const porPagina = filtros.porPagina ?? 24;
  const pagina = filtros.pagina ?? 1;

  if (USE_MOCK) {
    const { productos: todos } = leerCatalogo();
    let lista = todos.filter(productoActivo);

    if (filtros.categoriaSlug) {
      lista = lista.filter((p) => p.categoria.slug === filtros.categoriaSlug);
    }
    if (filtros.tipo) {
      lista = lista.filter((p) => p.tipo === filtros.tipo);
    }
    if (filtros.ml != null) {
      lista = lista.filter((p) => p.mililitros.includes(filtros.ml!));
    }

    const precioMin = (p: Producto) => Math.min(...Object.values(p.precios));
    if (filtros.orden === "precio-asc") {
      lista = [...lista].sort((a, b) => precioMin(a) - precioMin(b));
    } else if (filtros.orden === "precio-desc") {
      lista = [...lista].sort((a, b) => precioMin(b) - precioMin(a));
    } else {
      lista = [...lista].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const total = lista.length;
    const inicio = (pagina - 1) * porPagina;
    const productos = lista.slice(inicio, inicio + porPagina);
    return { productos, total };
  }

  const where = {
    activo: true,
    ...(filtros.categoriaSlug ? { categoria: { slug: filtros.categoriaSlug } } : {}),
    ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
    ...(filtros.ml != null ? { mililitros: { has: filtros.ml } } : {}),
  };

  // `precios` es Json, no se puede ordenar en SQL directo. Para "reciente"
  // (el caso más común) se pagina en la base; para orden por precio se trae
  // todo lo que matchea el filtro y se ordena/pagina en memoria.
  if (filtros.orden === "precio-asc" || filtros.orden === "precio-desc") {
    const todos = await prisma.producto.findMany({ where, include: { categoria: true } });
    const lista = (todos as unknown as Producto[]).slice();
    const precioMinDe = (p: Producto) => Math.min(...Object.values(p.precios));
    lista.sort((a, b) =>
      filtros.orden === "precio-asc" ? precioMinDe(a) - precioMinDe(b) : precioMinDe(b) - precioMinDe(a)
    );
    const inicio = (pagina - 1) * porPagina;
    return { productos: lista.slice(inicio, inicio + porPagina), total: lista.length };
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.producto.count({ where }),
  ]);

  return { productos: productos as unknown as Producto[], total };
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  if (USE_MOCK) {
    const { productos } = leerCatalogo();
    return productos.find((p) => p.slug === slug && p.activo) ?? null;
  }
  const producto = await prisma.producto.findUnique({
    where: { slug },
    include: { categoria: true },
  });
  return producto as unknown as Producto | null;
}

export async function getProductosDestacados(cantidad = 8): Promise<Producto[]> {
  if (USE_MOCK) {
    const { productos } = leerCatalogo();
    const marcados = productos
      .filter((p) => p.activo && p.destacado)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, cantidad);
    if (marcados.length > 0) return marcados;
    // Sin nada marcado como destacado todavía (catálogo recién cargado) —
    // no dejar la sección vacía: caer a los más recientes.
    const { productos: recientes } = await getProductos({ porPagina: cantidad, orden: "reciente" });
    return recientes;
  }

  const destacados = (await prisma.producto.findMany({
    where: { activo: true, destacado: true },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
    take: cantidad,
  })) as unknown as Producto[];
  if (destacados.length > 0) return destacados;
  const { productos: recientes } = await getProductos({ porPagina: cantidad, orden: "reciente" });
  return recientes;
}

export const usandoDatosMock = USE_MOCK;

// ---------------------------------------------------------------------
// Panel de admin — lectura completa (incluye inactivos) y mutaciones.
// Sin DATABASE_URL, lee y escribe siempre contra el JSON de
// lib/mock/store-file.ts (persiste entre reinicios del server, a
// diferencia de un array en memoria). Con DATABASE_URL, todo va directo a
// Prisma/Neon.
// ---------------------------------------------------------------------

export async function getCategoriasAdmin(): Promise<Categoria[]> {
  if (USE_MOCK) {
    const { categorias } = leerCatalogo();
    return [...categorias].sort((a, b) => a.orden - b.orden);
  }
  return prisma.categoria.findMany({ orderBy: { orden: "asc" } });
}

export async function getProductosAdmin(): Promise<Producto[]> {
  if (USE_MOCK) {
    const { productos } = leerCatalogo();
    return [...productos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return (await prisma.producto.findMany({
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  })) as unknown as Producto[];
}

export async function getProductoPorId(id: string): Promise<Producto | null> {
  if (USE_MOCK) {
    const { productos } = leerCatalogo();
    return productos.find((p) => p.id === id) ?? null;
  }
  const producto = await prisma.producto.findUnique({ where: { id }, include: { categoria: true } });
  return producto as unknown as Producto | null;
}

export type ProductoInput = {
  nombre: string;
  slug: string;
  descripcion: string | null;
  notas: string | null;
  tipo: Producto["tipo"];
  precios: Record<string, number>;
  mililitros: number[];
  cantidad: number;
  imagenes: string[];
  tieneMuestra: boolean;
  activo: boolean;
  destacado: boolean;
  categoriaId: string;
};

export async function crearProducto(input: ProductoInput): Promise<Producto> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const categoria = categorias.find((c) => c.id === input.categoriaId);
    if (!categoria) throw new Error("Categoría no encontrada");
    const nuevo: Producto = {
      id: `mock-${input.slug}-${Date.now()}`,
      ...input,
      createdAt: new Date(),
      categoria,
    };
    productos.unshift(nuevo);
    guardarCatalogo(categorias, productos);
    return nuevo;
  }
  const creado = await prisma.producto.create({ data: input, include: { categoria: true } });
  return creado as unknown as Producto;
}

export async function actualizarProducto(id: string, input: ProductoInput): Promise<Producto> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const idx = productos.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Producto no encontrado");
    const categoria = categorias.find((c) => c.id === input.categoriaId);
    if (!categoria) throw new Error("Categoría no encontrada");
    const actualizado: Producto = { ...productos[idx], ...input, categoria };
    productos[idx] = actualizado;
    guardarCatalogo(categorias, productos);
    return actualizado;
  }
  const actualizado = await prisma.producto.update({
    where: { id },
    data: input,
    include: { categoria: true },
  });
  return actualizado as unknown as Producto;
}

export async function eliminarProducto(id: string): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const idx = productos.findIndex((p) => p.id === id);
    if (idx !== -1) productos.splice(idx, 1);
    guardarCatalogo(categorias, productos);
    return;
  }
  await prisma.producto.delete({ where: { id } });
}

export async function toggleCategoriaActiva(id: string): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const cat = categorias.find((c) => c.id === id);
    if (cat) cat.activa = !cat.activa;
    guardarCatalogo(categorias, productos);
    return;
  }
  const cat = await prisma.categoria.findUnique({ where: { id } });
  if (!cat) throw new Error("Categoría no encontrada");
  await prisma.categoria.update({ where: { id }, data: { activa: !cat.activa } });
}
