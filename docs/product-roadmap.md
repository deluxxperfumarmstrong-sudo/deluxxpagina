# Roadmap de desarrollo — Deluxx Perfum

**Estado:** Fase 7 — construcción completa; quedan 4 puntos que requieren intervención del cliente (deploy en Vercel, credenciales de Neon/Cloudinary, Lighthouse en producción, datos de negocio reales) documentados en `docs/BLOQUEOS.md`. Ver ese archivo para el detalle completo de cada bloqueo.
**Spec:** [prd.md](prd.md) · **Diseño:** [design.md](design.md)

**Momento mágico:** un visitante entra, el hero de plasma grafito con filamentos rojos se mueve detrás del wordmark, navega a un perfume árabe, elige 100 ml, ve el precio y la seña actualizarse, lo agrega al carrito y cierra el pedido por WhatsApp sin fricción.

Las fases son secuenciales. Cada una se termina y se verifica antes de pasar a la siguiente.

---

## Fase 0 — Fundaciones

- [x] Inicializar Next.js 15 (App Router, TypeScript, Tailwind v4) y `git init`
- [x] Traducir los tokens de `docs/design.md` a variables CSS en `globals.css` (colores, tipografía, spacing, radios)
- [x] Cargar las fuentes Anton y Archivo con `next/font`
- [x] Configurar Prisma + conexión a Neon; `.env.example` con `DATABASE_URL` y credenciales de Cloudinary
- [x] Definir `schema.prisma` con `Categoria`, `Producto` y el enum `TipoProducto` (§2 del PRD)
- [~] Correr la primera migración y verificar la conexión con `prisma studio` — **bloqueado**: sin credenciales de Neon (ver `docs/BLOQUEOS.md`). `prisma generate` corre OK; la app sirve catálogo mock mientras tanto vía `lib/data.ts`.
- [x] Layout base: header con wordmark, nav y footer, sobre `background: #3A3A3D`

**Verificación:** `npm run dev` levanta, el layout respeta los tokens (fondo gris metálico, esquinas afiladas, tipografía condensada) y Prisma Studio muestra las dos tablas vacías.

---

## Fase 1 — Hero WebGL

- [x] Componente `HeroShader`: contexto WebGL1 plano, triángulo fullscreen, sin librerías
- [x] Cargar el fragment shader "Plasma" tal cual, sin modificarlo — el cliente pasó el prompt original (21st.dev Shader Builder); pegado literal en `shaders.ts`, reemplaza al shader propio que se había escrito como workaround.
- [x] Alimentar los uniforms con los valores re-tinteados del §5 del PRD — **`u_hue = 0.0` y `u_oklab = 1.0`**, 5 colores en la rampa (rojo como filamento angosto en vez de parada ancha — ver justificación en `shaders.ts`)
- [x] Capar `devicePixelRatio` a 2 y manejar el resize del canvas
- [x] Pausar el loop de RAF cuando `document.hidden` es `true` (confirmado empíricamente: en pestaña no visible el canvas no se redimensiona ni dibuja)
- [x] Fallback a gradiente CSS si no hay contexto WebGL
- [x] Respetar `prefers-reduced-motion: reduce` con un frame estático
- [x] Montar el hero con el wordmark DELUXX / PERFUM y el CTA encima del canvas

**Verificación:** el hero anima suave a 60 fps, se ve grafito con filamentos rojos ocasionales (no cyan, no rojo dominante), el texto encima se lee con contraste holgado, y el loop se frena al cambiar de pestaña. Calibrar `u_brightness` si el rojo queda granate.

---

## Fase 2 — Datos y contenido

- [x] Seed de las 5 categorías: Perfumería Árabe, De Nicho, De Diseñador, Kits, Decants (todas creadas, con o sin productos — regla 6)
- [~] Subir las fotos a Cloudinary en `deluxx/productos/`, nombradas `{slug}-1` / `{slug}-2` — **bloqueado**: sin cuenta de Cloudinary (ver `docs/BLOQUEOS.md`). Los productos ya referencian los `public_id` que van a resolver apenas se suban.
- [x] Armar la planilla de productos y exportarla a CSV — sustituido por `lib/mock/generar-productos.ts` (generador programático de 106 productos con nombres inventados, mismas reglas de negocio); reemplaza a la planilla real hasta que el cliente entregue el catálogo verdadero.
- [x] Escribir `prisma/seed.ts` con validación de coherencia `precios` ↔ `mililitros`
- [x] Cargar +100 productos con mezcla real de `ENCARGO` y `STOCK` — 106 activos (37 ENCARGO / 69 STOCK), verificado por script.
- [x] Verificar que al menos una categoría quede sin productos, para poder probar la regla 6 — "Kits" queda en 0 a propósito.

**Verificación:** hay +100 productos en Neon, cada uno con ~2 imágenes que resuelven desde Cloudinary, y el seed falla ruidosamente si un producto tiene un tamaño sin precio.

---

## Fase 3 — Catálogo

- [x] API Routes / Server Components que consultan Neon vía Prisma, sin exponer credenciales al cliente — `lib/data.ts` (con fallback a mock mientras no hay `DATABASE_URL`)
- [x] `ProductCard` según `design.md`: `surface`, radio 2 px, precio como titular
- [x] `/catalogo` con grilla generosa (espaciado editorial, pocos ítems por fila)
- [x] Filtros: categoría, tipo encargo/stock, tamaño en ml, orden por precio
- [x] Paginación para +100 productos (24 por página)
- [x] `/categoria/[slug]` pre-filtrado
- [x] Listado de categorías que **solo muestra las que tienen productos activos** (regla 6) — verificado: "Kits" no aparece en el selector pero `/categoria/kits` sigue respondiendo 200
- [x] Estados vacíos y de carga — `loading.tsx` (skeleton) y estado vacío en `GrillaProductos`

**Verificación:** los filtros combinan bien, la categoría sin productos no aparece en la navegación pero sigue existiendo en la base, y la grilla no se siente apretada.

---

## Fase 4 — Ficha de producto

- [x] `/producto/[slug]` con galería de las 2 fotos
- [x] `MlSelector` que solo ofrece los tamaños en `mililitros` (regla 8)
- [x] `PrecioBloque`: precio que se recalcula al cambiar de tamaño
- [x] Bloque de seña (50% del total) **solo si `tipo === ENCARGO`** (reglas 2 y 3) — verificado por curl en un producto de cada tipo
- [x] Badge de tipo: "Por encargo" / "En stock"
- [x] Badge "Muestra disponible" cuando `tieneMuestra` (regla 7)
- [x] Notas olfativas cuando existen (campo opcional)
- [x] Botón de agregar al carrito con el tamaño elegido

**Verificación:** cambiar de 50 a 200 ml actualiza precio y seña juntos; un producto en stock nunca muestra seña; un producto sin notas no deja un hueco vacío.

---

## Fase 5 — Carrito y checkout por WhatsApp

- [x] Store de carrito con Zustand persistido en `localStorage`
- [x] Ítems identificados por producto **+ tamaño** (el mismo perfume en 50 y 100 ml son líneas distintas)
- [x] `/carrito` con edición de cantidades y borrado de líneas
- [x] Subtotal, total y **total de seña** de los ítems por encargo
- [x] Generar el mensaje de WhatsApp con el template del §4 del PRD y abrir `wa.me` — verificado con un carrito mixto (mismo perfume en 50ml y 100ml + un producto STOCK)
- [x] Recordatorio de métodos de pago (transferencia, efectivo, dólares) en el checkout — regla 5
- [x] Recordatorio de plazos de envío en el checkout — regla 4

**Verificación:** un carrito mixto (encargo + stock, distintos tamaños) genera un mensaje legible con la seña correcta, y el carrito sobrevive al recargar la página.

---

## Fase 6 — Páginas de contenido y home

- [x] `/envios-y-pagos` con las reglas 4 y 5 en texto claro
- [x] `/muestras` explicando que se puede probar antes de comprar (regla 7)
- [x] Home: categorías activas, productos destacados, bloque de muestras, bloque de envíos y pagos — verificado que "Kits" no aparece
- [~] Completar los pendientes del §8 del PRD (ciudades de zona, número de WhatsApp, datos bancarios) — **bloqueado**: son datos reales del cliente, no inventables. Placeholders marcados `TODO(BLOQUEO)` en `lib/config.ts`, listados en `docs/BLOQUEOS.md`.

**Verificación:** un visitante nuevo entiende sin preguntar cómo compra, cómo paga, cuándo le llega y que puede pedir una muestra.

---

## Fase 7 — Pulido y despliegue

- [x] Responsive en mobile (el hero WebGL también) — menú hamburguesa agregado en `Header`/`MenuMovil`; el canvas del hero ya usaba `resize()` + DPR capado, válido en cualquier viewport
- [x] SEO: metadata por producto y categoría, Open Graph, `sitemap.xml` — `app/sitemap.ts`, `app/robots.ts`, metadata dinámica en `/producto/[slug]` y `/categoria/[slug]`
- [~] Optimización de imágenes vía transformaciones de Cloudinary — el código ya usa `next-cloudinary` (`CldImage`) cuando hay cuenta configurada; **bloqueado** por la falta de credenciales (ver más arriba)
- [x] Auditoría de accesibilidad: contraste, foco visible, navegación por teclado — `:focus-visible` global, `aria-label` en selects y botones de cantidad, `aria-hidden` en el canvas decorativo, roles en el selector de ml
- [x] Auditoría contra el `design.md`: sin sombras, sin esquinas redondeadas fuera de los chips, sin un segundo color de acento — barrido de `grep` sin hallazgos (el único `drop-shadow` es sobre el texto del hero, por legibilidad, no una sombra de superficie/botón)
- [~] Lighthouse ≥ 90 en performance y accesibilidad — **bloqueado**: no se pudo medir en esta sesión (el navegador de la sesión no compone frames reales, ver Fase 1). `npm run build` da bundles de 103–153 kB de First Load JS por ruta, razonable para Lighthouse, pero falta la medición real.
- [~] Deploy en Vercel con las variables de entorno de Neon y Cloudinary — **bloqueado**: requiere la cuenta de Vercel del cliente, no es una acción para tomar de forma autónoma. `npm run build` corre limpio, listo para deployar en cuanto haya cuenta + variables.
- [~] Verificación en producción del recorrido completo hasta WhatsApp — depende del deploy real y del número de WhatsApp real (ver bloqueos arriba). El flujo se probó end-to-end en local: catálogo → ficha → carrito → mensaje de WhatsApp con seña correcta.

**Verificación:** el sitio está en línea, un pedido real llega por WhatsApp con los datos correctos, y el hero anima en un teléfono de gama media sin trabar el scroll.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cargar +100 productos con fotos es lo que más tiempo consume | Empezar la Fase 2 en paralelo a la 1; no dejar la carga para el final |
| El shader puede tirar la performance en mobile | Capar DPR a 2, pausar con `document.hidden`, medir en dispositivo real en la Fase 7 |
| `u_hue = 3.04` heredado del preset convertiría el rojo en cyan | Ya está documentado en el §5 del PRD; verificar visualmente al cerrar la Fase 1 |
| Los pendientes del §8 bloquean las páginas de contenido | Consultarlos ahora, no en la Fase 6 |
