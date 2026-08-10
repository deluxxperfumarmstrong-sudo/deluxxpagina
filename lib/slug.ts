export function slugify(texto: string): string {
  return texto
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca tildes/diacríticos (á→a, ñ→n, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
