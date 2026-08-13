"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  crearProducto,
  actualizarProducto,
  actualizarStockProductos,
  eliminarProducto,
  reordenarProductos,
  toggleProductoDestacado,
  getProductoPorId,
  agregarMililitroACategoria,
  type ProductoInput,
} from "@/lib/data";
import { validarCoherenciaPreciosMl, validarCoherenciaStockMl } from "@/lib/validacion";
import { slugify } from "@/lib/slug";
import type { TipoProducto, Genero, Relevancia } from "@/lib/types";

// Textarea con una nota por línea — más simple de escribir/leer que un
// input de tags con Enter, y suficiente para lo que pide el admin (agregar,
// editar, borrar notas por etapa).
function leerNotas(formData: FormData, campo: string): string[] {
  return String(formData.get(campo) ?? "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

export type EstadoProducto = { error: string | null };

function leerFormulario(formData: FormData): ProductoInput {
  const mililitros = formData
    .getAll("mililitros")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  const precios: Record<string, number> = {};
  const preciosDescuento: Record<string, number> = {};
  const stock: Record<string, number> = {};
  for (const ml of mililitros) {
    const valor = Number(formData.get(`precio_${ml}`));
    if (!Number.isNaN(valor) && valor > 0) precios[String(ml)] = valor;

    // Opcional — un campo vacío o en 0 significa "sin descuento para este
    // tamaño", no un error. Si no mejora el precio de lista, `validar()` lo
    // rechaza más abajo en vez de guardarlo silenciosamente.
    const descuentoValor = Number(formData.get(`descuento_${ml}`));
    if (!Number.isNaN(descuentoValor) && descuentoValor > 0) {
      preciosDescuento[String(ml)] = descuentoValor;
    }

    const stockValor = Number(formData.get(`stock_${ml}`));
    stock[String(ml)] = !Number.isNaN(stockValor) && stockValor > 0 ? Math.floor(stockValor) : 0;
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  // Si el campo slug queda vacío, se autogenera a partir del nombre en vez
  // de exigirlo — sigue pudiéndose editar a mano para casos donde el nombre
  // no da un slug lindo (ej. nombres muy largos o con caracteres raros).
  const slugTipeado = slugify(String(formData.get("slug") ?? ""));
  const slug = slugTipeado || slugify(nombre);
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const notasSalida = leerNotas(formData, "notasSalida");
  const notasCorazon = leerNotas(formData, "notasCorazon");
  const notasFondo = leerNotas(formData, "notasFondo");
  const generoValor = String(formData.get("genero") ?? "UNISEX");
  const genero: Genero =
    generoValor === "MASCULINO" || generoValor === "FEMENINO" ? generoValor : "UNISEX";
  const relevanciaNum = Number(formData.get("relevancia"));
  const relevancia: Relevancia = relevanciaNum === 1 || relevanciaNum === 3 ? relevanciaNum : 2;
  const tipoRaw = String(formData.get("tipo") ?? "STOCK");
  const tipo: TipoProducto = tipoRaw === "ENCARGO" ? "ENCARGO" : "STOCK";
  // Los public_id de Cloudinary llegan como inputs ocultos repetidos
  // "imagenes", en el orden en que quedaron tras arrastrarlos en
  // ImagenesOrdenables — ese orden ES el orden final, no hace falta
  // reordenar nada acá.
  const imagenes = formData
    .getAll("imagenes")
    .map((v) => String(v).trim())
    .filter(Boolean);

  return {
    nombre,
    slug,
    descripcion: descripcion || null,
    notasSalida,
    notasCorazon,
    notasFondo,
    genero,
    relevancia,
    tipo,
    precios,
    preciosDescuento,
    mililitros,
    stock,
    imagenes,
    tieneMuestra: formData.get("tieneMuestra") === "on",
    activo: formData.get("activo") === "on",
    destacado: formData.get("destacado") === "on",
    categoriaId: String(formData.get("categoriaId") ?? ""),
  };
}

function validar(input: ProductoInput): string | null {
  if (!input.nombre) return "El nombre es obligatorio.";
  if (!input.slug) return "El slug es obligatorio.";
  if (!input.categoriaId) return "Elegí una categoría.";
  if (input.mililitros.length === 0) return "Elegí al menos un tamaño en ml.";
  try {
    validarCoherenciaPreciosMl(input);
    validarCoherenciaStockMl(input);
  } catch (e) {
    return e instanceof Error ? e.message : "Los precios no coinciden con los tamaños.";
  }
  for (const [ml, descuento] of Object.entries(input.preciosDescuento)) {
    if (descuento >= input.precios[ml]) {
      return `El precio con descuento de ${ml}ml tiene que ser menor al precio de lista ($${input.precios[ml]}).`;
    }
  }
  return null;
}

export async function crearProductoAction(
  _prevState: EstadoProducto,
  formData: FormData
): Promise<EstadoProducto> {
  await requireAdmin();
  const input = leerFormulario(formData);
  const error = validar(input);
  if (error) return { error };

  try {
    await crearProducto(input);
    // Un tamaño elegido que la categoría todavía no tenía (agregado a mano
    // desde este mismo formulario, ver ProductoForm.tsx) queda disponible
    // para el resto de los productos de la categoría a partir de acá.
    for (const ml of input.mililitros) {
      await agregarMililitroACategoria(input.categoriaId, ml);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo crear el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos?ok=creado");
}

export async function actualizarProductoAction(
  id: string,
  _prevState: EstadoProducto,
  formData: FormData
): Promise<EstadoProducto> {
  await requireAdmin();
  const input = leerFormulario(formData);
  const error = validar(input);
  if (error) return { error };

  try {
    await actualizarProducto(id, input);
    for (const ml of input.mililitros) {
      await agregarMililitroACategoria(input.categoriaId, ml);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo actualizar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/producto/${input.slug}`);
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos?ok=actualizado");
}

// A diferencia de crear/editar/eliminar, esta no hace redirect(): se llama
// desde un onClick (no un <form>) apenas se suelta un producto arrastrado,
// y una navegación completa en cada drop se sentiría roto (pierde el
// scroll, parpadea). El reorden ya se ve al instante en el cliente
// (estado local de ProductosOrdenables); esto solo persiste la verdad.
export async function reordenarProductosAction(idsEnOrden: string[]) {
  await requireAdmin();
  await reordenarProductos(idsEnOrden);
  revalidatePath("/admin/productos");
}

// Toggle rápido desde la lista (ProductosOrdenables) — igual que el reorden,
// no hace redirect(): es un click sobre una fila, no un <form>, y perder el
// scroll/estado de filtros en cada click sería peor experiencia.
export async function toggleProductoDestacadoAction(id: string): Promise<{ error: string | null }> {
  await requireAdmin();
  const actual = await getProductoPorId(id);
  if (!actual) return { error: "Producto no encontrado." };

  await toggleProductoDestacado(id);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null };
}

// Igual que el reorden y el toggle de destacado: se llama desde la barra de
// guardar de stock (no un <form>), así que sin redirect() — el estado
// optimista en ProductosOrdenables ya refleja el cambio, esto solo persiste
// la verdad y revalida las rutas públicas que muestran stock.
export async function actualizarStockAction(
  cambios: { id: string; slug: string; stock: Record<string, number> }[]
): Promise<{ error: string | null }> {
  await requireAdmin();
  if (cambios.length === 0) return { error: null };

  for (const cambio of cambios) {
    for (const [ml, cantidad] of Object.entries(cambio.stock)) {
      if (!Number.isInteger(cantidad) || cantidad < 0) {
        return { error: `Stock inválido para ${ml}ml — tiene que ser un entero mayor o igual a 0.` };
      }
    }
  }

  try {
    await actualizarStockProductos(cambios.map(({ id, stock }) => ({ id, stock })));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar el stock." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  for (const cambio of cambios) {
    revalidatePath(`/producto/${cambio.slug}`);
  }
  return { error: null };
}

export async function eliminarProductoAction(id: string) {
  await requireAdmin();
  await eliminarProducto(id);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  // Mismo patrón que crear/editar: un redirect() real fuerza una navegación
  // completa (GET fresco) en vez de confiar en que Next refresque en el
  // lugar la ruta actual tras una Server Action sin redirect — en la
  // práctica, sin esto, la mutación en memoria pasa pero la página se
  // queda mostrando el árbol viejo.
  redirect("/admin/productos?ok=eliminado");
}
