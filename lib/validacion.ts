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

/**
 * Valida que cada tamaño en `mililitros` tenga una entrada (aunque sea 0) en
 * `stock`. A diferencia de precios, no exige que sea > 0 — un tamaño puede
 * estar temporalmente agotado sin dejar de ser un tamaño válido del producto.
 */
export function validarCoherenciaStockMl(producto: Pick<Producto, "nombre" | "slug" | "stock" | "mililitros">) {
  for (const ml_ of producto.mililitros) {
    if (!(String(ml_) in producto.stock)) {
      throw new Error(
        `Producto "${producto.nombre}" (${producto.slug}): falta stock para ${ml_}ml en \`stock\`.`
      );
    }
  }
}
