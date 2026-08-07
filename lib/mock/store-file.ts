import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { generarCatalogoMock } from "./generar-productos";
import type { Categoria, Producto } from "@/lib/types";

// Next.js (en dev, y más todavía dentro de una carpeta sincronizada por
// OneDrive) puede cargar este módulo como instancias separadas para la capa
// de Server Actions y la capa de render de páginas — comprobado con
// gl.readPixels... digo, con un moduleInstanceId de debug: un array en
// memoria mutado desde una acción no se veía reflejado en la página aunque
// la mutación ocurriera de verdad. El filesystem sí es compartido entre
// ambos contextos (mismo proceso de Node), así que el store del "modo
// demo" vive en un JSON local en vez de en un módulo-singleton.
// No es un dato de negocio real — ver .gitignore.

const DIR = path.join(process.cwd(), ".mock-data");
const ARCHIVO = path.join(DIR, "catalogo.json");

type ProductoSerializado = Omit<Producto, "createdAt" | "categoria"> & {
  createdAt: string;
};

type CategoriaSerializada = Omit<Categoria, "createdAt"> & { createdAt: string };

type CatalogoSerializado = {
  categorias: CategoriaSerializada[];
  productos: ProductoSerializado[];
};

function guardar(categorias: Categoria[], productos: Producto[]) {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  const serializado: CatalogoSerializado = {
    categorias: categorias.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    productos: productos.map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se descarta `categoria` a propósito, se reconstruye al leer.
      const { categoria, createdAt, ...resto } = p;
      return { ...resto, createdAt: createdAt.toISOString() };
    }),
  };
  writeFileSync(ARCHIVO, JSON.stringify(serializado, null, 2), "utf-8");
}

function inicializar(): { categorias: Categoria[]; productos: Producto[] } {
  const base = generarCatalogoMock();
  guardar(base.categorias, base.productos);
  return base;
}

export function leerCatalogo(): { categorias: Categoria[]; productos: Producto[] } {
  if (!existsSync(ARCHIVO)) return inicializar();

  try {
    const raw = readFileSync(ARCHIVO, "utf-8");
    const data = JSON.parse(raw) as CatalogoSerializado;
    const categorias: Categoria[] = data.categorias.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
    const categoriaPorId = new Map(categorias.map((c) => [c.id, c]));
    const productos: Producto[] = data.productos.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      categoria: categoriaPorId.get(p.categoriaId)!,
    }));
    return { categorias, productos };
  } catch {
    return inicializar();
  }
}

export function guardarCatalogo(categorias: Categoria[], productos: Producto[]) {
  guardar(categorias, productos);
}
