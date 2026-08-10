"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  crearProducto,
  actualizarProducto,
  actualizarStockProductos,
  eliminarProducto,
  reordenarProductos,
  toggleProductoDestacado,
  contarProductosDestacados,
  getProductoPorId,
  type ProductoInput,
} from "@/lib/data";
import { validarCoherenciaPreciosMl, validarCoherenciaStockMl } from "@/lib/validacion";
import { MAX_DESTACADOS } from "@/lib/config";
import type { TipoProducto } from "@/lib/types";

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
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
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
    notas: notas || null,
    tipo: (formData.get("tipo") as TipoProducto) ?? "STOCK",
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
  const input = leerFormulario(formData);
  const error = validar(input);
  if (error) return { error };

  if (input.destacado && (await contarProductosDestacados()) >= MAX_DESTACADOS) {
    return { error: `Ya hay ${MAX_DESTACADOS} productos destacados — sacá uno antes de agregar otro.` };
  }

  try {
    await crearProducto(input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo crear el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function actualizarProductoAction(
  id: string,
  _prevState: EstadoProducto,
  formData: FormData
): Promise<EstadoProducto> {
  const input = leerFormulario(formData);
  const error = validar(input);
  if (error) return { error };

  if (input.destacado) {
    const actual = await getProductoPorId(id);
    if (!actual?.destacado && (await contarProductosDestacados()) >= MAX_DESTACADOS) {
      return { error: `Ya hay ${MAX_DESTACADOS} productos destacados — sacá uno antes de agregar otro.` };
    }
  }

  try {
    await actualizarProducto(id, input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo actualizar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/producto/${input.slug}`);
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

// A diferencia de crear/editar/eliminar, esta no hace redirect(): se llama
// desde un onClick (no un <form>) apenas se suelta un producto arrastrado,
// y una navegación completa en cada drop se sentiría roto (pierde el
// scroll, parpadea). El reorden ya se ve al instante en el cliente
// (estado local de ProductosOrdenables); esto solo persiste la verdad.
export async function reordenarProductosAction(idsEnOrden: string[]) {
  await reordenarProductos(idsEnOrden);
  revalidatePath("/admin/productos");
}

// Toggle rápido desde la lista (ProductosOrdenables) — igual que el reorden,
// no hace redirect(): es un click sobre una fila, no un <form>, y perder el
// scroll/estado de filtros en cada click sería peor experiencia.
export async function toggleProductoDestacadoAction(id: string): Promise<{ error: string | null }> {
  const actual = await getProductoPorId(id);
  if (!actual) return { error: "Producto no encontrado." };

  if (!actual.destacado && (await contarProductosDestacados()) >= MAX_DESTACADOS) {
    return { error: `Ya hay ${MAX_DESTACADOS} productos destacados — sacá uno antes de agregar otro.` };
  }

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
  await eliminarProducto(id);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  // Mismo patrón que crear/editar: un redirect() real fuerza una navegación
  // completa (GET fresco) en vez de confiar en que Next refresque en el
  // lugar la ruta actual tras una Server Action sin redirect — en la
  // práctica, sin esto, la mutación en memoria pasa pero la página se
  // queda mostrando el árbol viejo.
  redirect("/admin/productos");
}
