export type TipoProducto = "ENCARGO" | "STOCK";

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  orden: number;
  activa: boolean;
  createdAt: Date;
};

export type Producto = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  notas: string | null;
  tipo: TipoProducto;
  precios: Record<string, number>;
  mililitros: number[];
  cantidad: number;
  imagenes: string[];
  tieneMuestra: boolean;
  activo: boolean;
  // Curado a mano desde el admin — decide qué aparece en "Destacados" del
  // home (antes eran simplemente los más recientes).
  destacado: boolean;
  createdAt: Date;
  categoriaId: string;
  categoria: Categoria;
};

export type CatalogoFiltros = {
  categoriaSlug?: string;
  tipo?: TipoProducto;
  ml?: number;
  orden?: "precio-asc" | "precio-desc" | "reciente";
  pagina?: number;
  porPagina?: number;
};
