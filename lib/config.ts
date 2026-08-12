// Datos de negocio pendientes de confirmar con el cliente — ver docs/BLOQUEOS.md.
// Reemplazar estos placeholders antes de ir a producción (Fase 7).

export const SLOGAN = "Encontrá tu aroma, definí tu estilo.";

export const SITE = {
  nombre: "Deluxx Perfum",
  descripcion:
    "Perfumería árabe, de nicho, de diseñador y kits. Por pedido y en stock.",
  url: "https://deluxxpagina.vercel.app",
};

export const WHATSAPP = {
  numero: "5493471610346",
};

export const INSTAGRAM = {
  usuario: "deluxx_perfum",
  url: "https://www.instagram.com/deluxx_perfum/",
};

export const ENVIOS = {
  // Regla de negocio confirmada: el envío en el día es exclusivo de
  // Armstrong. Cualquier otra ciudad despacha pasadas 24 h hábiles.
  ciudadZona: "Armstrong",
  plazoZona: "en el día",
  plazoResto: "24 h hábiles",
};

export const PAGOS = {
  metodos: ["Transferencia bancaria", "Efectivo", "Dólares"] as const,
  // TODO(BLOQUEO): alias/CBU real para transferencias.
  aliasTransferencia: "deluxx.perfum.placeholder",
  // TODO(BLOQUEO): cotización del dólar a usar para pagos en USD (regla 5).
  notaCotizacionUsd: "Cotización del dólar a acordar al momento del pedido.",
};

// Tamaños válidos de ml para perfumes (regla 8). Los decants podrían usar una
// escala propia (3/5/10 ml) — sin definición del cliente, se reutiliza esta
// misma escala también para decants por simplicidad (ver docs/BLOQUEOS.md).
export const MILILITROS_VALIDOS = [50, 55, 75, 90, 100, 120, 150, 200] as const;

// Cuántos productos "Destacado" muestra el home (ver app/page.tsx) — no es
// un tope de cuántos productos puede marcar el admin como destacado, esa
// marca no tiene límite; esto solo recorta cuántos entran en esa sección.
// De esos 9, el 9° queda oculto en mobile (ver DestacadosGrid) para no
// dejar una fila de 1 sola columna en la grilla de a 2.
export const DESTACADOS_HOME = 9;

export const CATEGORIAS_SEED = [
  { nombre: "Árabe", slug: "perfumeria-arabe" },
  { nombre: "Nicho", slug: "de-nicho" },
  { nombre: "Diseñador", slug: "de-disenador" },
  { nombre: "Kits", slug: "kits" },
] as const;

// Fuente única para el nav del header y el menú móvil — evita que se
// desincronicen entre sí.
export const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/muestras", label: "Muestras" },
  { href: "/envios-y-pagos", label: "Envíos y pagos" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/soporte", label: "Soporte" },
] as const;
