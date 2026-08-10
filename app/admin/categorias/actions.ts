"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toggleCategoriaActiva, reordenarCategorias, crearCategoria } from "@/lib/data";
import { slugify } from "@/lib/slug";

export type EstadoCategoria = { error: string | null };

export async function crearCategoriaAction(
  _prevState: EstadoCategoria,
  formData: FormData
): Promise<EstadoCategoria> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const slugTipeado = slugify(String(formData.get("slug") ?? ""));
  const slug = slugTipeado || slugify(nombre);
  const imagenUrl = String(formData.get("imagenUrl") ?? "").trim();
  const mililitrosDisponibles = formData
    .getAll("mililitrosDisponibles")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!slug) return { error: "No se pudo generar un slug a partir del nombre — probá con otro." };
  if (!imagenUrl) {
    return { error: "La imagen es obligatoria — se usa como acceso directo en la home." };
  }
  if (mililitrosDisponibles.length === 0) {
    return { error: "Elegí al menos un tamaño disponible para esta categoría." };
  }

  try {
    await crearCategoria({ nombre, slug, imagenUrl, mililitrosDisponibles });
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

export async function toggleCategoriaAction(id: string) {
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
  await reordenarCategorias(idsEnOrden);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/catalogo");
}
