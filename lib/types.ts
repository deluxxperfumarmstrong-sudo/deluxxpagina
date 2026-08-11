export type TipoProducto = "ENCARGO" | "STOCK";
export type Genero = "MASCULINO" | "FEMENINO" | "UNISEX";
// 1 = baja, 2 = media, 3 = alta (la más relevante primero al ordenar).
export type Relevancia = 1 | 2 | 3;

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  // public_id de Cloudinary (no una URL completa) — ver comentario en schema.prisma.
  imagenUrl: string | null;
  // Subconjunto de MILILITROS_VALIDOS elegible al cargar un producto de esta categoría.
  mililitrosDisponibles: number[];
  orden: number;
  activa: boolean;
  createdAt: Date;
};

export type Producto = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  notasSalida: string[];
  notasCorazon: string[];
  notasFondo: string[];
  genero: Genero;
  relevancia: Relevancia;
  tipo: TipoProducto;
  precios: Record<string, number>;
  preciosDescuento: Record<string, number>;
  mililitros: number[];
  stock: Record<string, number>;
  imagenes: string[];
  tieneMuestra: boolean;
  activo: boolean;
  // Curado a mano desde el admin — decide qué aparece en "Destacados" del
  // home (antes eran simplemente los más recientes).
  destacado: boolean;
  // Orden manual (drag & drop) en /admin/productos — no es el orden público
  // del catálogo, que sigue siendo por fecha/precio (ver CatalogoFiltros).
  orden: number;
  createdAt: Date;
  categoriaId: string;
  categoria: Categoria;
};

// Lo mínimo que el nav necesita de una categoría. Se arma en el layout
// (server) desde getCategoriasActivas y baja a Header/MenuMovil, que son
// client components y no pueden consultar la base por su cuenta.
export type CategoriaNav = { nombre: string; slug: string };

export type CatalogoFiltros = {
  categoriaSlug?: string;
  tipo?: TipoProducto;
  ml?: number;
  genero?: Genero;
  relevancia?: Relevancia[];
  q?: string;
  orden?: "precio-asc" | "precio-desc" | "reciente" | "relevancia";
  pagina?: number;
  porPagina?: number;
};
