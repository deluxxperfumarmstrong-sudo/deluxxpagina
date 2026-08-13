"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  toggleCategoriaActiva,
  reordenarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  type CategoriaInput,
} from "@/lib/data";
import { slugify } from "@/lib/slug";

export type EstadoCategoria = { error: string | null };

function leerCategoriaFormulario(formData: FormData): CategoriaInput {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const slugTipeado = slugify(String(formData.get("slug") ?? ""));
  const slug = slugTipeado || slugify(nombre);
  const imagenUrl = String(formData.get("imagenUrl") ?? "").trim();
  const mililitrosDisponibles = formData
    .getAll("mililitrosDisponibles")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  return { nombre, slug, imagenUrl, mililitrosDisponibles };
}

function validarCategoria(input: CategoriaInput): string | null {
  if (!input.nombre) return "El nombre es obligatorio.";
  if (!input.slug) return "No se pudo generar un slug a partir del nombre — probá con otro.";
  if (!input.imagenUrl) {
    return "La imagen es obligatoria — se usa como acceso directo en la home.";
  }
  if (input.mililitrosDisponibles.length === 0) {
    return "Elegí al menos un tamaño disponible para esta categoría.";
  }
  return null;
}

export async function crearCategoriaAction(
  _prevState: EstadoCategoria,
  formData: FormData
): Promise<EstadoCategoria> {
  await requireAdmin();
  const input = leerCategoriaFormulario(formData);
  const error = validarCategoria(input);
  if (error) return { error };

  try {
    await crearCategoria(input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo crear la categoría." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function actualizarCategoriaAction(
  id: string,
  _prevState: EstadoCategoria,
  formData: FormData
): Promise<EstadoCategoria> {
  await requireAdmin();
  const input = leerCategoriaFormulario(formData);
  const error = validarCategoria(input);
  if (error) return { error };

  try {
    await actualizarCategoria(id, input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar la categoría." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}

// Sin redirect a propósito, igual que el toggle y el reorden — se llama
// desde un botón con confirmación en la propia lista (CategoriasOrdenables),
// no desde un formulario de página completa.
export async function eliminarCategoriaAction(id: string): Promise<{ error: string | null }> {
  await requireAdmin();
  try {
    await eliminarCategoria(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo eliminar la categoría." };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null };
}

export async function toggleCategoriaAction(id: string) {
  await requireAdmin();
  await toggleCategoriaActiva(id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/catalogo");
  // Ver el comentario en admin/productos/actions.ts — redirect() a la misma
  // ruta fuerza una navegación fresca en vez de confiar en el refresh
  // automático tras una Server Action.
  redirect("/admin/categorias");
}

// Sin redirect a propósito (ver reordenarProductosAction): se dispara desde
// un drop de drag & drop, no un <form>, y el reorden ya se ve al instante
// en el cliente.
export async function reordenarCategoriasAction(idsEnOrden: string[]) {
  await requireAdmin();
  await reordenarCategorias(idsEnOrden);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/catalogo");
}
