import { prisma } from "@/lib/prisma";
import { leerCatalogo, guardarCatalogo } from "@/lib/mock/store-file";
import type { Categoria, CatalogoFiltros, Producto } from "@/lib/types";
import { precioDesde } from "@/lib/precio";

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

export async function getCategoriaPorId(id: string): Promise<Categoria | null> {
  if (USE_MOCK) {
    const { categorias } = leerCatalogo();
    return categorias.find((c) => c.id === id) ?? null;
  }
  return prisma.categoria.findUnique({ where: { id } });
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
    if (filtros.genero) {
      lista = lista.filter((p) => p.genero === filtros.genero);
    }
    if (filtros.relevancia && filtros.relevancia.length > 0) {
      lista = lista.filter((p) => filtros.relevancia!.includes(p.relevancia));
    }
    if (filtros.q && filtros.q.trim()) {
      const termino = filtros.q.trim().toLowerCase();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(termino));
    }

    if (filtros.orden === "precio-asc") {
      lista = [...lista].sort((a, b) => precioDesde(a) - precioDesde(b));
    } else if (filtros.orden === "precio-desc") {
      lista = [...lista].sort((a, b) => precioDesde(b) - precioDesde(a));
    } else if (filtros.orden === "relevancia") {
      lista = [...lista].sort((a, b) => b.relevancia - a.relevancia);
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
    ...(filtros.genero ? { genero: filtros.genero } : {}),
    ...(filtros.relevancia && filtros.relevancia.length > 0
      ? { relevancia: { in: filtros.relevancia } }
      : {}),
    ...(filtros.q && filtros.q.trim()
      ? { nombre: { contains: filtros.q.trim(), mode: "insensitive" as const } }
      : {}),
  };

  // `precios` es Json, no se puede ordenar en SQL directo. Para "reciente"
  // (el caso más común) y "relevancia" (columna real, sí se puede ordenar en
  // SQL) se pagina en la base; para orden por precio se trae todo lo que
  // matchea el filtro y se ordena/pagina en memoria.
  if (filtros.orden === "precio-asc" || filtros.orden === "precio-desc") {
    const todos = await prisma.producto.findMany({ where, include: { categoria: true } });
    const lista = (todos as unknown as Producto[]).slice();
    lista.sort((a, b) =>
      filtros.orden === "precio-asc" ? precioDesde(a) - precioDesde(b) : precioDesde(b) - precioDesde(a)
    );
    const inicio = (pagina - 1) * porPagina;
    return { productos: lista.slice(inicio, inicio + porPagina), total: lista.length };
  }

  const orderBy = filtros.orden === "relevancia" ? { relevancia: "desc" as const } : { createdAt: "desc" as const };

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy,
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
    // Mismo orden manual que /admin/productos (drag & drop) — así que
    // reordenar la tabla ahí también reordena el bloque de Destacados del
    // home, en vez de depender de cuándo se creó cada producto.
    const marcados = productos
      .filter((p) => p.activo && p.destacado)
      .sort((a, b) => a.orden - b.orden)
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
    orderBy: { orden: "asc" },
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
    return [...productos].sort((a, b) => a.orden - b.orden);
  }
  return (await prisma.producto.findMany({
    include: { categoria: true },
    orderBy: { orden: "asc" },
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
  notasSalida: string[];
  notasCorazon: string[];
  notasFondo: string[];
  genero: Producto["genero"];
  relevancia: Producto["relevancia"];
  tipo: Producto["tipo"];
  precios: Record<string, number>;
  preciosDescuento: Record<string, number>;
  mililitros: number[];
  stock: Record<string, number>;
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
    // Nuevo producto va al final del orden manual, no mezclado en el medio.
    const ordenMax = productos.reduce((max, p) => Math.max(max, p.orden), -1);
    const nuevo: Producto = {
      id: `mock-${input.slug}-${Date.now()}`,
      ...input,
      orden: ordenMax + 1,
      createdAt: new Date(),
      categoria,
    };
    productos.unshift(nuevo);
    guardarCatalogo(categorias, productos);
    return nuevo;
  }
  const agregado = await prisma.producto.aggregate({ _max: { orden: true } });
  const creado = await prisma.producto.create({
    data: { ...input, orden: (agregado._max.orden ?? -1) + 1 },
    include: { categoria: true },
  });
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

// Update liviano usado por la edición inline de stock en /admin/productos —
// a diferencia de actualizarProducto no pasa por ProductoInput completo (no
// tiene sentido reenviar nombre/precios/imágenes solo para tocar stock), y
// actualiza varios productos de una sola pasada porque el panel de stock
// permite editar varias filas antes de guardar.
export async function actualizarStockProductos(
  cambios: { id: string; stock: Record<string, number> }[]
): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    for (const cambio of cambios) {
      const idx = productos.findIndex((p) => p.id === cambio.id);
      if (idx === -1) throw new Error("Producto no encontrado");
      productos[idx] = { ...productos[idx], stock: cambio.stock };
    }
    guardarCatalogo(categorias, productos);
    return;
  }
  await prisma.$transaction(
    cambios.map((cambio) =>
      prisma.producto.update({ where: { id: cambio.id }, data: { stock: cambio.stock } })
    )
  );
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

export type CategoriaInput = {
  nombre: string;
  slug: string;
  imagenUrl: string;
  mililitrosDisponibles: number[];
};

export async function crearCategoria(input: CategoriaInput): Promise<Categoria> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const ordenMax = categorias.reduce((max, c) => Math.max(max, c.orden), -1);
    const nueva: Categoria = {
      id: `mock-cat-${input.slug}-${Date.now()}`,
      nombre: input.nombre,
      slug: input.slug,
      descripcion: null,
      imagenUrl: input.imagenUrl,
      mililitrosDisponibles: input.mililitrosDisponibles,
      orden: ordenMax + 1,
      activa: true,
      createdAt: new Date(),
    };
    categorias.push(nueva);
    guardarCatalogo(categorias, productos);
    return nueva;
  }
  const agregado = await prisma.categoria.aggregate({ _max: { orden: true } });
  return prisma.categoria.create({
    data: { ...input, orden: (agregado._max.orden ?? -1) + 1 },
  });
}

export async function actualizarCategoria(id: string, input: CategoriaInput): Promise<Categoria> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const idx = categorias.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Categoría no encontrada");
    const actualizada: Categoria = { ...categorias[idx], ...input };
    categorias[idx] = actualizada;
    // Los productos ya cargados guardan su propia copia de `categoria`
    // (denormalizada, ver ProductoInput/crearProducto) — sin esto, la lista
    // de tamaños vieja seguía apareciendo en `/admin/productos` hasta que
    // cada producto se reguardara.
    for (const p of productos) {
      if (p.categoriaId === id) p.categoria = actualizada;
    }
    guardarCatalogo(categorias, productos);
    return actualizada;
  }
  return prisma.categoria.update({ where: { id }, data: input });
}

// No se permite borrar una categoría con productos (activos o no) — Postgres
// igual lo rechazaría por la FK `Producto.categoriaId`, pero acá se valida
// antes para poder devolver un mensaje claro en vez de un error de base
// crudo, y para no dejar productos con una referencia que apunta a nada.
export async function eliminarCategoria(id: string): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    if (productos.some((p) => p.categoriaId === id)) {
      throw new Error(
        "No se puede eliminar: hay productos en esta categoría. Reasignalos o eliminalos primero."
      );
    }
    const idx = categorias.findIndex((c) => c.id === id);
    if (idx !== -1) categorias.splice(idx, 1);
    guardarCatalogo(categorias, productos);
    return;
  }
  const cantidad = await prisma.producto.count({ where: { categoriaId: id } });
  if (cantidad > 0) {
    throw new Error(
      "No se puede eliminar: hay productos en esta categoría. Reasignalos o eliminalos primero."
    );
  }
  await prisma.categoria.delete({ where: { id } });
}

// Usado desde ProductoForm cuando se carga un tamaño que la categoría
// todavía no tiene — el tamaño queda disponible para el resto de los
// productos de esa categoría a partir de ahí, sin duplicarse si ya estaba.
export async function agregarMililitroACategoria(categoriaId: string, ml: number): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const cat = categorias.find((c) => c.id === categoriaId);
    if (!cat) throw new Error("Categoría no encontrada");
    if (!cat.mililitrosDisponibles.includes(ml)) {
      cat.mililitrosDisponibles = [...cat.mililitrosDisponibles, ml].sort((a, b) => a - b);
      for (const p of productos) {
        if (p.categoriaId === categoriaId) p.categoria = cat;
      }
    }
    guardarCatalogo(categorias, productos);
    return;
  }
  const cat = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!cat) throw new Error("Categoría no encontrada");
  if (cat.mililitrosDisponibles.includes(ml)) return;
  await prisma.categoria.update({
    where: { id: categoriaId },
    data: { mililitrosDisponibles: [...cat.mililitrosDisponibles, ml].sort((a, b) => a - b) },
  });
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

export async function contarProductosDestacados(): Promise<number> {
  if (USE_MOCK) {
    const { productos } = leerCatalogo();
    return productos.filter((p) => p.destacado).length;
  }
  return prisma.producto.count({ where: { destacado: true } });
}

export async function toggleProductoDestacado(id: string): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const producto = productos.find((p) => p.id === id);
    if (!producto) throw new Error("Producto no encontrado");
    producto.destacado = !producto.destacado;
    guardarCatalogo(categorias, productos);
    return;
  }
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) throw new Error("Producto no encontrado");
  await prisma.producto.update({ where: { id }, data: { destacado: !producto.destacado } });
}

// Reordenar por drag & drop — `idsEnOrden` es la lista completa (sin
// filtrar) en el nuevo orden; se renumera 0..n-1 para que quede siempre
// consecutivo. Por eso el admin desactiva el arrastre mientras hay una
// búsqueda/filtro activo (ver ProductosOrdenables.tsx): reordenar un
// subconjunto dejaría huecos que no tienen un resultado obvio.
export async function reordenarProductos(idsEnOrden: string[]): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const posicion = new Map(idsEnOrden.map((id, i) => [id, i]));
    for (const p of productos) {
      const nuevaPos = posicion.get(p.id);
      if (nuevaPos != null) p.orden = nuevaPos;
    }
    guardarCatalogo(categorias, productos);
    return;
  }
  // $transaction con un array es todo-o-nada: un solo id que ya no exista
  // (borrado desde otra pestaña mientras este admin tenía la lista vieja en
  // pantalla) tira P2025 y revierte el lote ENTERO, no solo esa fila. Se
  // filtra contra la base antes de armar la transacción para que un id
  // fantasma no invalide el reorden de los demás.
  const existentes = new Set(
    (await prisma.producto.findMany({ where: { id: { in: idsEnOrden } }, select: { id: true } })).map(
      (p) => p.id
    )
  );
  const idsValidos = idsEnOrden.filter((id) => existentes.has(id));
  await prisma.$transaction(
    idsValidos.map((id, i) => prisma.producto.update({ where: { id }, data: { orden: i } }))
  );
}

export async function reordenarCategorias(idsEnOrden: string[]): Promise<void> {
  if (USE_MOCK) {
    const { categorias, productos } = leerCatalogo();
    const posicion = new Map(idsEnOrden.map((id, i) => [id, i]));
    for (const c of categorias) {
      const nuevaPos = posicion.get(c.id);
      if (nuevaPos != null) c.orden = nuevaPos;
    }
    guardarCatalogo(categorias, productos);
    return;
  }
  const existentes = new Set(
    (await prisma.categoria.findMany({ where: { id: { in: idsEnOrden } }, select: { id: true } })).map(
      (c) => c.id
    )
  );
  const idsValidos = idsEnOrden.filter((id) => existentes.has(id));
  await prisma.$transaction(
    idsValidos.map((id, i) => prisma.categoria.update({ where: { id }, data: { orden: i } }))
  );
}
