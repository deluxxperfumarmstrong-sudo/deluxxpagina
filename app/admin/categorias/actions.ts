"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toggleCategoriaActiva, reordenarCategorias } from "@/lib/data";

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
