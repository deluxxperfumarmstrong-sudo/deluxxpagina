# PRD — Deluxx Perfum

Tienda online de perfumería (árabe, nicho, diseñador, kits y decants) con catálogo de +100 productos, pedidos por encargo y en stock, y cierre de compra por WhatsApp. Sin pasarela de pago.

**Documentos relacionados:** [design.md](design.md) (tokens y reglas visuales) · `Reglas de Negocio Deluxx.pdf` (fuente de las reglas 1–8) · `stack-ecommerce.md` (stack).

---

## 1. Stack y decisiones resueltas

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** |
| Estilos | Tailwind CSS v4 con los tokens de `docs/design.md` |
| ORM | Prisma |
| Base de datos | Neon (PostgreSQL serverless) |
| Imágenes | Cloudinary (`next-cloudinary`) |
| Hosting | Vercel |
| Carga de datos | Prisma Studio + script de seed |

### Decisiones que resuelven ambigüedades del stack

**Next.js en vez de Vite.** `stack-ecommerce.md` pide "React (Vite)" y a la vez "API Routes de Next.js". Son dos frameworks incompatibles en un mismo proyecto. Next.js **es** React, cubre el requisito de frontend en React, provee las API Routes que el propio documento pide para no exponer credenciales de Neon en el bundle, y despliega en Vercel en un solo flujo. Vite requeriría dos proyectos separados sin ganancia alguna.

**Checkout por WhatsApp.** No hay pasarela de pago y los métodos son transferencia, efectivo y dólares — todos acordados persona a persona. El carrito arma un mensaje pre-formateado y abre `wa.me`. Esto evita una tabla `Pedido` y deja las 2 clases del modelo para `Producto` y `Categoria`, que es lo que la regla 6 exige (categorías que existen sin productos cargados).

**Precio por tamaño.** La regla 8 permite elegir entre 50/55/75/90/100/120/150/200 ml. Un perfume de 50 ml y uno de 200 ml no valen lo mismo, así que `precios` es un campo `Json` que mapea ml → precio. No agrega una tercera tabla.

**Seña derivada, no almacenada.** La regla 2 define la seña como la mitad del total. Se calcula en runtime (`precio / 2`) para productos `ENCARGO`. Guardarla sería duplicar estado y arriesgar que se desincronice al cambiar el precio.

---

## 2. Modelo de datos

Dos clases, según la consigna. Los 8 parámetros de negocio de `Producto` salen literalmente de las reglas 2 y 3 (nombre, notas, cantidad, mililitros, precio, tipo, imágenes, categoría); el resto son campos de infraestructura (`id`, `slug`, `activo`, `createdAt`).

```prisma
enum TipoProducto {
  ENCARGO   // requiere seña = 50% del total (regla 2)
  STOCK     // entrega inmediata, sin seña (regla 3)
}

model Categoria {
  id          String     @id @default(cuid())
  nombre      String     @unique
  slug        String     @unique
  descripcion String?
  imagenUrl   String?
  orden       Int        @default(0)
  activa      Boolean    @default(true)
  createdAt   DateTime   @default(now())
  productos   Producto[]
}

model Producto {
  id           String       @id @default(cuid())
  nombre       String
  slug         String       @unique
  descripcion  String?
  notas        String?      // opcional (regla 2)
  tipo         TipoProducto @default(STOCK)
  precios      Json         // { "50": 28000, "100": 45000 }
  mililitros   Int[]        // subconjunto de [50,55,75,90,100,120,150,200] (regla 8)
  cantidad     Int          @default(0)
  imagenes     String[]     // ~2 public_id de Cloudinary
  tieneMuestra Boolean      @default(false) // regla 7
  activo       Boolean      @default(true)
  createdAt    DateTime     @default(now())
  categoriaId  String
  categoria    Categoria    @relation(fields: [categoriaId], references: [id])

  @@index([categoriaId])
  @@index([tipo])
}
```

**Invariante a validar en el seed y en la carga:** cada clave de `precios` debe existir en `mililitros`, y viceversa. Un producto con un tamaño listado pero sin precio rompe la página de producto.

---

## 3. Reglas de negocio → dónde viven

| # | Regla | Implementación |
|---|---|---|
| 1 | Pedidos por encargo y en stock | `Producto.tipo` (enum). Filtro en catálogo y badge en card y ficha. |
| 2 | Encargo: nombre, notas, cantidad, ml, precio, **seña 50%** | Ficha de producto muestra `Seña para pedir: $X` calculado. El mensaje de WhatsApp incluye la seña total del pedido. |
| 3 | Stock: igual pero sin seña | Cuando `tipo === STOCK` no se renderiza el bloque de seña. |
| 4 | Envíos: zona en el día, resto +24 h hábiles | Página `/envios-y-pagos` + bloque en carrito. Ciudades de zona en `lib/config.ts` (**pendiente de definir con el cliente**). |
| 5 | Pagos: transferencia, efectivo, dólares | Página `/envios-y-pagos` + recordatorio en el paso de checkout. Sin integración de pago. |
| 6 | Solo se muestran categorías con productos; las demás quedan creadas | Query filtra `productos: { some: { activo: true } }`. Las 5 categorías se crean siempre en el seed. |
| 7 | Hay muestras para probar antes de comprar | `Producto.tieneMuestra` → badge "Muestra disponible" en la ficha + sección explicativa en `/muestras` y en el home. |
| 8 | Tamaños seleccionables 50–200 ml según disponibilidad | Selector de ml en la ficha; solo renderiza los valores en `mililitros`. El precio y la seña se recalculan al cambiar de tamaño. |

**Categorías del seed (regla 6):** Perfumería Árabe, De Nicho, De Diseñador, Kits, Decants.

---

## 4. Mapa de páginas

| Ruta | Contenido |
|---|---|
| `/` | Hero WebGL (§5), categorías activas, destacados, bloque de muestras, bloque de envíos/pagos |
| `/catalogo` | Grilla con filtros: categoría, tipo (encargo/stock), rango de ml, orden por precio. Paginación o scroll infinito sobre +100 productos |
| `/categoria/[slug]` | Catálogo pre-filtrado por categoría |
| `/producto/[slug]` | Galería (2 fotos), selector de ml, precio dinámico, seña si es encargo, notas, badge de muestra, agregar al carrito |
| `/carrito` | Ítems con ml y cantidad, subtotal, total de seña, y CTA que abre WhatsApp con el mensaje armado |
| `/envios-y-pagos` | Reglas 4 y 5 en texto |
| `/muestras` | Regla 7 explicada |

**Componentes clave:** `HeroShader`, `ProductCard`, `MlSelector`, `PrecioBloque` (precio + seña), `FiltrosCatalogo`, `CarritoDrawer`, `WhatsAppCTA`.

**Estado del carrito:** Zustand con persistencia en `localStorage`. Sin sesión ni login.

**Mensaje de WhatsApp (template):**
```
Hola Deluxx! Quiero hacer este pedido:

• {nombre} — {ml}ml × {cantidad} — ${subtotal}  [ENCARGO · seña ${seña}]
• ...

Total: ${total}
Seña a abonar: ${señaTotal}
```

---

## 5. Hero — shader WebGL "Plasma"

Canvas absoluto detrás del contenido del hero, triángulo fullscreen en WebGL1 sin librerías, `devicePixelRatio` capado a 2, y RAF pausado con `document.hidden`.

**Shader:** el fragment shader "Plasma" provisto por el cliente, sin modificar.

**Re-tinte a marca.** La paleta original (cyan, hue 174°) contradice el *Don't* de `design.md` — "no introducir un segundo color de acento". Se conserva el shader y su *feel*, y se reemplaza únicamente la paleta:

```js
u_colors[0..4] = [
  [0.039, 0.039, 0.039],  // #0A0A0A  negro
  [0.165, 0.165, 0.173],  // #2A2A2C  surface
  [0.333, 0.333, 0.353],  // #55555A  surface-metallic
  [0.831, 0.137, 0.157],  // #D42328  accent — filamento rojo
  [0.929, 0.929, 0.929],  // #EDEDED  on-surface
]
u_scene     = [w, h, seconds * 0.86, 5.0]   // 5.0 = cantidad de colores
u_shape     = [1.50, 0.48, 0.50, 0.00]
u_surface   = [2.40, 0.92, -0.50, 1.00]
u_finish    = [0.00, 0.61, 0.016, 0.35]     // hue → 0.0 (ver abajo)
u_transform = [7.0, 0.00, 0.16, 1.0]        // oklab → 1.0 (ver abajo)
u_space     = [0.00, 0.00, 0.0, 0.0]
u_cursor    = [0.0, 4.0, 0.65, 0.30]        // cursor off
```

Tres notas de implementación que no son opcionales:

- **`u_hue` debe ser 0.0.** El valor original `3.04` rad ≈ 174° rota el matiz. Si se dejan los colores de marca con esa rotación, el rojo `#D42328` sale **cyan** y el re-tinte no sirve de nada.
- **`u_oklab` en 1.0.** La transición grafito → rojo en sRGB pasa por marrones sucios. En OKLab la interpolación es perceptual y el filamento rojo se mantiene limpio.
- **Rojo al 75% de la rampa, no en los extremos.** La función `shade` samplea con `0.5 + 0.5*sin(v)`, cuya distribución se concentra en los extremos. Con 5 paradas, negro y blanco dominan la superficie y el rojo aparece como filamento ocasional — que es exactamente lo que pide `design.md` ("mantener el rojo como acento raro").

**A calibrar en QA visual:** `u_brightness = -0.50` oscurece bastante; si el filamento rojo queda granate y no se lee, subir a `-0.30`. El hero lleva texto encima, así que el criterio es contraste del texto primero, vistosidad del shader después.

**Accesibilidad y performance:**
- Respetar `prefers-reduced-motion: reduce` → render de un solo frame estático (o gradiente CSS de fallback).
- Fallback si `getContext('webgl')` devuelve `null` → gradiente CSS `#0A0A0A → #3A3A3D`.
- Solo en el hero del home. No repetir el canvas en otras rutas.

---

## 6. Carga de contenido

+100 productos y ~2 fotos cada uno es la parte más laboriosa del proyecto y hay que planificarla, no improvisarla al final.

- **Fotos:** subida por lotes a Cloudinary, carpeta `deluxx/productos/`, nombradas `{slug}-1` / `{slug}-2`. Se guarda el `public_id`, no la URL completa, para poder cambiar transformaciones sin migrar datos.
- **Datos:** planilla → CSV → `prisma/seed.ts`. El seed valida la coherencia `precios` ↔ `mililitros` antes de insertar.
- **Edición posterior:** Prisma Studio (`npx prisma studio`). No se construye panel de admin — no está en la consigna y consumiría el tiempo del catálogo.

---

## 7. Fuera de alcance

Pasarela de pago · cuentas de usuario y login · panel de administración web · gestión de stock en tiempo real · reviews · wishlist · multi-idioma · seguimiento de envíos.

---

## 8. Pendientes de definir con el cliente

1. **Ciudades de "zona"** para envío en el día (regla 4).
2. **Número de WhatsApp** de destino del checkout.
3. **Datos bancarios / alias** para transferencia y **cotización del dólar** a usar (regla 5).
4. Si los **decants** usan la misma escala de ml (50–200) o uno propio (3/5/10 ml) — la regla 8 no lo aclara y afecta al selector.
