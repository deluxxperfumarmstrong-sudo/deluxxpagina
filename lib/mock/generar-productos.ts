import { MILILITROS_VALIDOS, CATEGORIAS_SEED } from "@/lib/config";
import type { Categoria, Producto, TipoProducto } from "@/lib/types";

// Generador determinístico de catálogo mock (Fase 2). Nombres inventados —
// no son marcas reales — para poder construir la UI sin depender de Neon ni
// de la planilla real del cliente. Ver docs/BLOQUEOS.md.

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PALABRAS_ARABE = [
  "Oud Sultán", "Ámbar Real", "Rosa de Taif", "Musgo Negro", "Bakhoor Dorado",
  "Almizcle Blanco", "Incienso Real", "Safran Noir", "Dahn Al Oud", "Layali",
  "Zafira", "Qamar", "Nakhil", "Shams Al Layl", "Reyhan", "Amiri", "Wardah",
  "Habb Al Sultan", "Anbar Khaliji", "Nadeem", "Fajr", "Ghazal Al Layl",
  "Dunya Oud", "Malak Al Musk", "Hind", "Karam", "Zahra Al Sahra",
  "Yasmine Al Sham", "Baraka", "Sahara Ember",
];

const PALABRAS_NICHO = [
  "Petrichor 12", "Vetiver Crudo", "Cuero Salvaje", "Fumée Blanche", "Iris Gris",
  "Ámbar Grís 03", "Sal Negra", "Cedro Ártico", "Incienso Urbano", "Bergamota Fría",
  "Almizcle Cero", "Piel de Papel", "Humo de Roble", "Cardamomo Salvaje",
  "Resina Fósil", "Tinta y Cuero", "Sándalo Mineral", "Ozono", "Ceniza Blanca",
  "Raíz Amarga", "Musgo de Roca", "Concreto Húmedo", "Whisky Ahumado",
  "Violeta Metálica", "Cuir Noir", "Grafito", "Sal de Mar", "Tabaco Verde",
];

const PALABRAS_DISENADOR = [
  "Noir Absolu", "Élan", "Signature Homme", "Rive Nocturne", "Éclat Doré",
  "Velvet Suit", "Legacy", "Maison Bleu", "Étoile Noire", "Prestige",
  "Icône", "Grand Soir", "Attitude", "Monogramme", "Héritage",
  "Faubourg", "Séduction", "Boulevard", "Diamant Noir", "Panache",
  "Allure Homme", "Sovereign", "Vertige", "Cristal Sombre", "Émeraude",
  "Aristocrate", "Noblesse", "Renaissance",
];

const NOTAS_BASE = [
  "Bergamota, cardamomo, oud, ámbar, almizcle",
  "Azafrán, rosa, cuero, sándalo, vainilla",
  "Pomelo, pimienta rosa, vetiver, cedro",
  "Incienso, oud, resina, pachulí",
  "Manzana, canela, tabaco, haba tonka",
  "Bergamota, lavanda, iris, almizcle blanco",
  "Naranja sanguina, jengibre, cuero, ámbar",
  "Sal marina, cedro atlas, musgo de roble",
];

type CategoriaSeedSlug = (typeof CATEGORIAS_SEED)[number]["slug"];

const BANCOS: Record<CategoriaSeedSlug, string[]> = {
  "perfumeria-arabe": PALABRAS_ARABE,
  "de-nicho": PALABRAS_NICHO,
  "de-disenador": PALABRAS_DISENADOR,
  kits: [],
};

// Conteos por categoría — "kits" queda con 0 productos activos a propósito
// para poder probar la regla 6 (categoría sin productos activos no se lista).
const CONTEOS: Record<CategoriaSeedSlug, number> = {
  "perfumeria-arabe": 30,
  "de-nicho": 28,
  "de-disenador": 28,
  kits: 0,
};

const PRECIO_BASE_ML: Record<number, number> = {
  50: 24000,
  55: 26000,
  75: 32000,
  90: 36000,
  100: 40000,
  120: 47000,
  150: 56000,
  200: 70000,
};

function precioParaProducto(ml: number, multiplicador: number) {
  const base = PRECIO_BASE_ML[ml];
  // Redondea al centenar más cercano tras aplicar el multiplicador (%).
  return Math.round((base * multiplicador) / 100 / 100) * 100;
}

function generarProductosCategoria(
  categoriaSlug: CategoriaSeedSlug,
  categoriaId: string,
  cantidad: number
): Producto[] {
  const nombres = BANCOS[categoriaSlug];
  const productos: Producto[] = [];

  for (let i = 0; i < cantidad; i++) {
    const nombreBase = nombres[i % nombres.length];
    const nombre = i >= nombres.length ? `${nombreBase} II` : nombreBase;
    const slug = slugify(`${categoriaSlug}-${nombre}-${i}`);
    const tipo: TipoProducto = i % 3 === 0 ? "ENCARGO" : "STOCK";

    // Subconjunto de mililitros disponibles — varía por índice para dar
    // variedad real de tamaños entre productos.
    const inicio = i % 3;
    const mililitros = MILILITROS_VALIDOS.filter((_, idx) => idx >= inicio && idx <= inicio + 4);

    const multiplicador = 90 + ((i * 7) % 60); // variación de precio 90%–150%
    const precios: Record<string, number> = {};
    for (const ml of mililitros) {
      precios[String(ml)] = precioParaProducto(ml, multiplicador);
    }

    productos.push({
      id: `mock-${slug}`,
      nombre,
      slug,
      descripcion: `${nombre} — fragancia de la colección ${nombreCategoria(categoriaSlug)}.`,
      notas: NOTAS_BASE[i % NOTAS_BASE.length],
      tipo,
      precios,
      mililitros,
      cantidad: tipo === "STOCK" ? 5 + (i % 10) : 0,
      imagenes: [`deluxx/productos/${slug}-1`, `deluxx/productos/${slug}-2`],
      tieneMuestra: i % 4 !== 0,
      activo: true,
      destacado: i % 7 === 0,
      createdAt: new Date(2026, 0, 1 + (i % 28)),
      categoriaId,
      categoria: undefined as unknown as Categoria,
    });
  }

  return productos;
}

function nombreCategoria(slug: CategoriaSeedSlug) {
  return CATEGORIAS_SEED.find((c) => c.slug === slug)?.nombre ?? slug;
}

export function generarCatalogoMock(): { categorias: Categoria[]; productos: Producto[] } {
  const categorias: Categoria[] = CATEGORIAS_SEED.map((c, idx) => ({
    id: `mock-cat-${c.slug}`,
    nombre: c.nombre,
    slug: c.slug,
    descripcion: null,
    imagenUrl: null,
    orden: idx,
    activa: true,
    createdAt: new Date(2026, 0, 1),
  }));

  const productos: Producto[] = [];
  for (const cat of categorias) {
    const seedSlug = cat.slug as CategoriaSeedSlug;
    const generados = generarProductosCategoria(seedSlug, cat.id, CONTEOS[seedSlug]);
    for (const p of generados) {
      p.categoria = cat;
      productos.push(p);
    }
  }

  return { categorias, productos };
}
