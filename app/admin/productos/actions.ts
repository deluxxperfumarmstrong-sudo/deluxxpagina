"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  type ProductoInput,
} from "@/lib/data";
import { validarCoherenciaPreciosMl } from "@/lib/validacion";
import type { TipoProducto } from "@/lib/types";

export type EstadoProducto = { error: string | null };

function leerFormulario(formData: FormData): ProductoInput {
  const mililitros = formData
    .getAll("mililitros")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  const precios: Record<string, number> = {};
  for (const ml of mililitros) {
    const valor = Number(formData.get(`precio_${ml}`));
    if (!Number.isNaN(valor) && valor > 0) precios[String(ml)] = valor;
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const imagen1 = String(formData.get("imagen1") ?? "").trim();
  const imagen2 = String(formData.get("imagen2") ?? "").trim();

  return {
    nombre,
    slug,
    descripcion: descripcion || null,
    notas: notas || null,
    tipo: (formData.get("tipo") as TipoProducto) ?? "STOCK",
    precios,
    mililitros,
    cantidad: Number(formData.get("cantidad") ?? 0),
    imagenes: [imagen1, imagen2].filter(Boolean),
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
  } catch (e) {
    return e instanceof Error ? e.message : "Los precios no coinciden con los tamaños.";
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
