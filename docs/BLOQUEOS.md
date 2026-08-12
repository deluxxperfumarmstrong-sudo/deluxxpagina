# Bloqueos — requieren intervención del cliente

Este documento se actualiza a medida que avanza el build autónomo (ver
`docs/product-roadmap.md`). Nada de esto detiene el desarrollo: donde falta
un dato o una credencial, el código sigue con un placeholder marcado `TODO`
o con datos mock, para no frenar la construcción de la UI.

## Panel de administración (`/admin`)

Nuevo — login simple (`ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` en
`.env.local`/`.env.example`, cookie firmada con HMAC vía Web Crypto, protegida
por `middleware.ts`) y CRUD de productos/categorías.

**Acción del cliente:** cambiar `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` por
valores propios antes de producción (hoy son placeholders de desarrollo en
`.env.local`, que no se commitea).

**Nota técnica — por qué el store mock vive en un archivo:** al mutar
productos/categorías sin `DATABASE_URL`, se detectó que Next.js (en este
entorno particular, dentro de una carpeta sincronizada por OneDrive) carga
`lib/data.ts` como **instancias de módulo separadas** entre la ejecución de
Server Actions y el render de páginas — confirmado con un ID de instancia de
debug: una acción que "eliminaba" un producto de un array en memoria no se
veía reflejada en la página siguiente, aunque el array SÍ quedaba modificado
dentro de esa misma ejecución. Por eso el store del modo demo
(`lib/mock/store-file.ts`) lee/escribe un JSON en `.mock-data/` (gitignored)
en vez de mutar un array module-level: el filesystem sí es compartido entre
ambos contextos. Efecto colateral positivo: los cambios ahora **persisten
entre reinicios** del servidor de desarrollo (antes se perdían). Con
`DATABASE_URL` configurado, nada de esto aplica — todo va directo a
Prisma/Neon.

## Reseñas de clientes (home)

El bloque "Lo que dicen nuestros clientes" (`components/home/BloqueResenas.tsx`,
carrusel infinito) tiene 5 reseñas placeholder — texto genérico, sin nombre
real, `role` genérico ("Compra por encargo", etc.). **Acción del cliente:**
pasar las reseñas reales (nombre o iniciales, texto, puntaje 1-5, y
opcionalmente ciudad/tipo de compra) para reemplazar el array `RESENAS` en
ese archivo.

## Credenciales (Fase 0 / Fase 2)

- **Neon (`DATABASE_URL`, `DIRECT_URL`)**: no hay credenciales cargadas.
  `.env.example` ya tiene el formato esperado. Mientras no exista
  `DATABASE_URL` en el entorno, `lib/data.ts` sirve el catálogo desde
  `lib/mock/generar-productos.ts` (100+ productos generados localmente,
  mismas reglas de negocio) para poder construir y probar toda la UI.
  **Acción del cliente:** crear un proyecto en https://neon.tech, copiar la
  connection string a `.env.local` y correr `npx prisma migrate dev` +
  `npm run seed`.
- **Cloudinary** (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`): no hay cuenta configurada. Los productos mock
  referencian `public_id`s de la forma `deluxx/productos/{slug}-1` que no
  existen todavía; `components/ui/ImagenProducto.tsx` muestra un placeholder
  tonal (sin foto) cuando Cloudinary no está configurado o la imagen no
  resuelve, así que el catálogo se ve completo igual.
  **Acción del cliente:** crear cuenta gratuita en https://cloudinary.com,
  cargar credenciales en `.env.local`, y subir las fotos reales a
  `deluxx/productos/` siguiendo la convención `{slug}-1` / `{slug}-2`.

## Datos de negocio (`lib/config.ts`)

Todos marcados con `TODO(BLOQUEO)` en el archivo:

1. **Alias/CBU para transferencias** (`PAGOS.aliasTransferencia`, regla 5).
2. **Cotización del dólar a usar** para pagos en USD (`PAGOS.notaCotizacionUsd`,
   regla 5) — hoy es una nota genérica en vez de un número.

Resuelto: la ciudad de envío en el día es **Armstrong** (`ENVIOS.ciudadZona`,
regla 4) y el número de WhatsApp real (`WHATSAPP.numero`) — datos reales
confirmados, ya no son placeholders.

## Shader "Plasma" (Fase 1) — resuelto

El shader original no vino con el resto de la spec (`design.md`, `prd.md`,
la PDF de reglas). Se escribió un shader propio como workaround para no
frenar la Fase 1; después el cliente pasó el prompt original (21st.dev
Shader Builder) con el fragment shader real. Ese código quedó pegado tal
cual, sin modificar, en `components/hero/shaders.ts` — es el shader
definitivo, ya no el workaround.

Detalles de la integración:
- El shader real soporta hasta 8 colores (`u_colors[8]`) y corta en
  `u_scene.w` (colorCount); se cargan los 5 colores de marca del §5 del PRD
  y `u_scene.w = 5.0`, el resto del array queda en `(0,0,0)` sin usarse.
- `u_finish.x` (hue) = 0.0 y `u_transform.w` (oklab) = 1.0 — no
  negociables, anulan el preset original del cliente (hue 174° / oklab
  apagado) para que el rojo de marca no salga cyan y la mezcla sea
  perceptual.
- El resto de los uniforms (`u_shape`, `u_surface`, `u_transform.x/y/z`,
  `u_cursor`) son los valores literales del §5 del PRD — con el shader
  real (a diferencia del workaround) sí producen el resultado esperado,
  verificado con `gl.readPixels`: rojo raro (~0.1% de la superficie en las
  muestras tomadas), nunca cyan.
- El negro `#0A0A0A` del preset original se reemplazó por `#232325`
  (`surface-raised`, el tono más oscuro que realmente existe en
  `design.md`) a pedido del cliente, para que el hero quede en la misma
  familia de grises que el resto del sitio en vez de negro puro.

**Corrección posterior — el shader ya NO está literal (autorizado por el
cliente).** El hero congelaba la pantalla hasta salir de él, tanto en
algunas PCs de escritorio como en Android. La causa medida: la `palette()`
del preset original mezclaba las 8 paradas en OKLab **en vivo, por pixel**,
encadenando 7 `mixColour()` de ~15 `pow()` cada uno; y como `u_finish.z`
(blur) es 0.016, `main()` pedía 5 muestras de color por pixel. Total ~525
`pow()` por pixel por frame. Medido en la iGPU AMD de desarrollo: **10,89
ms/frame a 1080p con dpr 1** — a dpr 2 son ~44 ms, casi tres presupuestos
de frame enteros solo para el fondo, antes de three.js, React y el scroll.

`palette(x)` es función pura de `x` y de uniforms constantes, así que la
rampa pasó a calcularse una sola vez en el CPU (`components/hero/paletaLut.ts`,
port literal de las funciones OKLab que estaban en el shader) y a entrar
como textura de 1024×1. El shader quedó con un `texture2D()` en lugar de la
mezcla. **No es una aproximación:** es la misma mezcla OKLab, tabulada.
Verificado renderizando ambos shaders con los mismos uniforms y comparando
los framebuffers a 4 tiempos distintos — diferencia máxima **1 nivel sobre
255**, promedio 0,06, que es el redondeo de 8 bits y queda muy por debajo
del grano de ±45/255 que el propio shader agrega encima. Costo: 0,48
ms/frame, **22,8× más rápido**.

`u_colors[8]` desapareció como uniform (los colores ahora alimentan la
tabla) y `u_oklab`/`u_colorCount` quedaron como `#define` sin lector: la
decisión de mezclar en OKLab se toma al construir la tabla. Los valores del
§5 del PRD no cambiaron: el resultado en pantalla es el mismo.

**Verificación visual pendiente:** el navegador de esta sesión no pudo
tomar una captura de pantalla real (el panel no está desplegado en pantalla
durante el build automático), así que todo lo de arriba se validó
numéricamente leyendo píxeles del framebuffer, no a ojo. Falta la
verificación visual humana que pide la Fase 1 (60 fps sensación, contraste
del texto, look final) — revisar en el navegador en cuanto se pueda.

## Deploy a Vercel (Fase 7)

No se hizo el deploy real. Publicar en un hosting de producción es una
acción que afecta un sistema compartido/externo y requiere la cuenta de
Vercel del cliente — no es algo para hacer de forma autónoma sin
confirmación. Lo que sí quedó resuelto de este lado:

- `npm run build` corre limpio (11 rutas, ~103–153 kB de First Load JS por
  página, sin errores de ESLint ni de TypeScript).
- `app/sitemap.ts` y `app/robots.ts` listos (usan `SITE.url` de
  `lib/config.ts` — **hay que actualizar ese valor con el dominio real antes
  de deployar**, hoy es un placeholder `https://deluxxperfum.vercel.app`).
- `.env.example` documenta las variables que hay que cargar en Vercel:
  `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

**Acción del cliente:** conectar el repo a Vercel (o correr `vercel` desde la
CLI), cargar esas variables de entorno, y correr `npx prisma migrate deploy`
+ `npm run seed` contra la base de Neon de producción antes o después del
primer deploy. Una vez en línea, correr Lighthouse contra la URL real (esta
sesión no pudo medirlo: el navegador de la sesión no renderiza frames reales
— ver la nota de la Fase 1 — así que no hay métrica de performance
confiable para reportar todavía) y probar el recorrido completo hasta
WhatsApp con el número real cargado en `lib/config.ts`.

## Decisiones técnicas ambiguas, ya resueltas

- **Escala de ml para decants:** el PRD (§8) deja abierto si los decants usan
  la escala 50–200 ml o una propia (3/5/10 ml). Se optó por reutilizar la
  misma escala de `MILILITROS_VALIDOS` (50–200) para no introducir un tercer
  campo de configuración sin que el cliente lo pida. Si el cliente confirma
  que decants usa 3/5/10 ml, hay que: (a) agregar esos valores a
  `MILILITROS_VALIDOS` o crear una escala separada, y (b) regenerar
  `lib/mock/generar-productos.ts` y el seed real.
- **Categoría sin productos para probar la regla 6:** se dejó "Kits" con 0
  productos activos en el catálogo mock/seed (a propósito, no es un bug) para
  poder verificar que no aparece en la navegación pero sigue existiendo en la
  base. Cuando el cliente traiga el catálogo real, es probable que "Kits" sí
  tenga productos — en ese caso otra categoría puede quedar vacía
  naturalmente y esta nota deja de aplicar.
- **Next.js 15 vs. 16:** `create-next-app@latest` instaló Next 16 por
  defecto; se fijó la versión a `15.5.22` (última de la serie 15) porque el
  PRD especifica Next 15 explícitamente y Next 16 trae cambios de breaking
  no evaluados para este proyecto.
