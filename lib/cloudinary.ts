// Borrado de assets en Cloudinary. SOLO SERVIDOR: usa CLOUDINARY_API_SECRET,
// que no lleva el prefijo NEXT_PUBLIC_ justamente para que nunca viaje al
// cliente. No importar este archivo desde un componente con "use client".
//
// Se habla con la Admin API por fetch en vez de sumar el SDK `cloudinary`
// (~2 MB de dependencia para una sola llamada). La forma del request está
// verificada contra la cuenta real, no sacada de memoria:
//   DELETE https://api.cloudinary.com/v1_1/<cloud>/resources/image/upload
//          ?public_ids[]=<id>&public_ids[]=<id>
//   Authorization: Basic base64(api_key:api_secret)
//   → {"deleted":{"<id>":"deleted"},"deleted_counts":{…},"partial":false}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Tope que acepta la Admin API por llamada.
const LOTE_MAX = 100;

function configurado() {
  return !!CLOUD && CLOUD !== "dxxxxxx" && !!API_KEY && !!API_SECRET;
}

/**
 * Borra assets de la biblioteca de Cloudinary por public_id.
 *
 * Es best-effort a propósito: quien la llama ya borró el producto de la base,
 * que es la fuente de verdad. Si Cloudinary está caído o responde mal, el
 * peor caso es una imagen huérfana en la biblioteca — molesto pero inocuo
 * (el storage de todo el catálogo es ~0,2 de los 25 créditos mensuales). Lo
 * que NO puede pasar es que el admin vea un error o se le trabe el borrado
 * del producto por un problema de un servicio externo, así que nunca lanza.
 *
 * No se usa `invalidate=true`: eso además purga el CDN, tarda bastante y
 * tiene límites propios. Para una imagen cuyo producto ya no existe, que
 * quede una copia cacheada un rato no le hace mal a nadie.
 */
export async function eliminarImagenes(publicIds: string[]): Promise<void> {
  if (!configurado() || publicIds.length === 0) return;

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

  for (let i = 0; i < publicIds.length; i += LOTE_MAX) {
    const lote = publicIds.slice(i, i + LOTE_MAX);
    const params = new URLSearchParams();
    for (const id of lote) params.append("public_ids[]", id);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/resources/image/upload?${params}`,
        {
          method: "DELETE",
          headers: { Authorization: `Basic ${auth}` },
          // Sin timeout, una Admin API colgada dejaría esperando al admin
          // hasta que el runtime corte la función.
          signal: AbortSignal.timeout(8000),
        }
      );
      if (!res.ok) {
        console.error(
          `Cloudinary: no se pudieron borrar ${lote.length} imagen(es) (HTTP ${res.status}).`,
          await res.text().catch(() => "")
        );
      }
    } catch (e) {
      console.error("Cloudinary: falló el borrado de imágenes.", e);
    }
  }
}
