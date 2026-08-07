import type { Producto } from "@/lib/types";

/**
 * Valida que cada clave de `precios` exista en `mililitros` y viceversa.
 * Lanza un error descriptivo (falla ruidosa) si algo no coincide.
 */
export function validarCoherenciaPreciosMl(producto: Pick<Producto, "nombre" | "slug" | "precios" | "mililitros">) {
  const clavesPrecios = Object.keys(producto.precios).map(Number);
  const ml = producto.mililitros;

  for (const ml_ of ml) {
    if (!(String(ml_) in producto.precios)) {
      throw new Error(
        `Producto "${producto.nombre}" (${producto.slug}): falta precio para ${ml_}ml en \`precios\`.`
      );
    }
  }

  for (const clave of clavesPrecios) {
    if (!ml.includes(clave)) {
      throw new Error(
        `Producto "${producto.nombre}" (${producto.slug}): \`precios\` tiene ${clave}ml pero no está en \`mililitros\`.`
      );
    }
  }
}
