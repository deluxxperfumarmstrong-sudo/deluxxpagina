# Resumen — Pase de mejora UI/UX

Ver [PLAN.md](PLAN.md) para el método y los hallazgos completos. Este
documento es el estado final: qué se hizo, cómo se verificó, y qué queda.

## Pase 1 — Commits (11 mejoras + 1 baseline)

1. `chore` — commit inicial del proyecto (no había ningún commit previo).
2. `fix(a11y)` — token `--color-accent-text`: el rojo de marca (#D42328)
   usado como texto/borde en reposo sobre `background`/`surface` medía
   2.20:1 y 2.64:1 de contraste (falla WCAG AA). Nuevo tono #F0898E
   (misma hue, más claro) verificado ≥4.5:1 en ambos fondos.
3. `fix(a11y)` — aplicó `accent-text` en los 10 lugares donde el accent
   se usaba como texto/borde en reposo (botones outline, badges, "seña"
   en carrito/ficha, links). Los fills (botón sólido + texto blanco)
   quedaron igual porque ya cumplían.
4. `fix(a11y)` — el estado "Agregado ✓" usaba texto blanco sobre
   `--color-success` (3.29:1, falla) → texto oscuro (6.02:1).
5. `fix(design-system)` — `.text-caption` y `.chip-tag` se usaban como
   className en 6+ archivos pero nunca estuvieron definidas (Tailwind
   v4 las ignora en silencio); ahora son clases reales en
   `@layer components`, consolidando 3 duplicaciones de badge.
6. `fix(design-system)` — 5 badges de ícono con `rounded-full` violaban
   la regla explícita de `design.md` ("rounded.full solo para
   chip/tag") → `rounded-sm`.
7. `fix(a11y)` — steppers de cantidad (carrito 32×40px, ficha 40×48px)
   por debajo del target táctil de 44px → 44px mínimo en ambos.
8. `refactor(ux)` — quitados 4 kickers/eyebrows arriba de H1
   (soporte, quienes-somos, envíos-y-pagos, login admin) — ban
   explícito del craft-floor de `impeccable`.
9. `feat(ux)` — menú móvil: backdrop, cierre con click afuera/Escape,
   `inert` + `aria-hidden` mientras está cerrado. Verificado en
   navegador: abre con backdrop, backdrop cierra, Escape cierra,
   `inert` cambia correctamente.
10. `fix(theming)` — `color-scheme: dark` en `:root`. Sin esto, los
    `<select>` y checkboxes nativos (filtros de catálogo, formularios
    de admin) se pintaban con el chrome claro del SO sobre una UI
    oscura. Verificado: `getComputedStyle(html).colorScheme === "dark"`.
11. `fix(a11y)` — el carrusel de reseñas duplica cada card para el loop
    visual sin ocultarlo de lectores de pantalla (cada reseña se
    anunciaba dos veces). Track marcado `aria-hidden`, agregada lista
    `sr-only` con el contenido real — mismo patrón que ya usaba
    `CintaBeneficios`. Verificado: 5 items en la lista sr-only, track
    con `aria-hidden="true"`.
12. `feat(ux)` — nav de header y menú móvil ahora marcan la página
    activa (`aria-current="page"` + subrayado/color).

## Verificación

Todo lo visual/interactivo se probó contra un dev server real
(`localhost:3000`) con lectura de DOM, consola, y disparo de eventos
reales (click, pointerdown, keydown) — no solo lectura de código.
Confirmado sin errores de consola en home, catálogo, quiénes-somos,
envíos-y-pagos, con los cambios de color/spacing/kickers ya aplicados.

**Nota:** hacia el final del pase el dev server (compartido con otra
sesión sobre el mismo directorio) empezó a devolver 500 "Internal
Server Error" sin overlay de Next.js — no atribuible a los cambios
acá: `npx tsc --noEmit` corre limpio (cero errores) y el commit #12
usa exactamente el mismo hook (`usePathname`) que `SiteChrome.tsx` ya
usaba sin problemas antes de este pase. No se intentó reiniciar ese
proceso por no ser de esta sesión. Si al leer esto el sitio sigue sin
levantar, reiniciar el dev server (`npm run dev`) debería alcanzar.

## Pase 2 — Auditoría específica mobile (`localhost:53872`, viewport 375×812)

El dev server de la otra sesión (puerto 3000) había quedado devolviendo
500 en algún punto entre pases — se levantó un servidor propio con
`autoPort` (commit 13) para no interferir, y se auditó cada ruta con
lectura real de DOM (`getBoundingClientRect`, `getComputedStyle`,
eventos disparados), no solo lectura de código.

**Hallazgo raíz (commit 14):** `docs/design.md` implementa su escala de
spacing editorial sobreescribiendo directamente los tokens numéricos de
Tailwind (`--spacing-6: 48px` en vez del stock `24px`, etc.) — correcto
para el espaciado de secciones/cards, pero eso también le cambia el
significado a *cualquier otra* clase numerada del sitio:

- El gutter de página `px-6 md:px-12` (17 archivos) se escribió
  asumiendo Tailwind estándar (24px mobile → 48px desktop). Con el
  override, `px-6` pasó a valer 48px también — mobile terminó con el
  mismo padding que desktop, comiéndose 96px (26%) de una pantalla de
  375px antes de que empiece cualquier contenido.
- El padding de botón `px-8 py-4` (10 botones CTA) se escribió para
  calzar con el propio spec de `design.md` ("button-primary: padding
  16px 32px" — que sí es el valor stock de Tailwind). Con el override
  terminó en 96px/24px, 3× de más. En mobile esto no fue solo estético:
  el botón "Agregar al carrito" de la ficha de producto, apretado
  contra el selector de cantidad, envolvía en 3 líneas (108px de alto)
  — el bug más grave que encontré en todo el pase, porque bloquea la
  acción de conversión principal del sitio en su canal más usado.

Ambos se corrigieron sin tocar el token compartido (`--spacing-6` sigue
en 48px donde sí se usa a propósito): el gutter mobile pasó a `px-4`
(24px reales) y los botones a `px-[32px] py-[16px]` explícito, que es
literalmente el valor que `design.md` documenta.

**Efecto dominó (commit 15):** una vez arreglado el padding del botón,
seguían envolviendo en 2 líneas el CTA de WhatsApp en `/soporte` y el
de "Ir a soporte" en `/quienes-somos` — sus cards contenedoras (`p-6
md:p-8`) todavía dejaban muy poco ancho en 375px. Se redujo el padding
mobile de esas cards puntuales (`p-4`) y los botones pasaron a
`w-full` en mobile, mismo patrón de "apilar en vertical" que ya usa
`FichaProducto`.

**Además, en el mismo pase:**
- Objetivos táctiles reales por debajo de 44px en el botón hamburguesa
  (48×26 → 44×44, sin cambiar el tamaño visual del ícono), el link
  "Carrito" del header, los links del footer y del menú móvil (sin
  padding vertical, tap area = solo el alto de línea de texto), los
  chips de tamaño en la ficha de producto (84×38 → min-h-11), y el
  botón "Quitar" del carrito (40×20 → 44×44).
- Los 4 `<select>` de `FiltrosCatalogo` estaban en `text-sm` (14px) —
  por debajo de 16px, iOS Safari hace zoom automático al enfocar el
  campo. Subidos a `text-base` en mobile.

Verificado ruta por ruta en el viewport de 375px: cero overflow
horizontal, todos los CTAs en una sola línea donde corresponde, todos
los objetivos táctiles medidos ≥44px, `npx tsc --noEmit` limpio.

## Qué NO se tocó (y por qué)

- Paleta, tipografía, spacing scale, sharp corners: ya cumplían
  `design.md` y estaban bien ejecutados.
- Panel de admin: se dejó igual salvo el fix de contraste transversal
  en el botón "Desactivar" de categorías (mismo patrón accent-text) y
  el arreglo de `color-scheme` que beneficia sus inputs/checkboxes de
  paso.
- Contenido de reseñas placeholder: ya está marcado como pendiente del
  cliente en `docs/BLOQUEOS.md`, no es un problema de UI.

## Follow-ups identificados pero no aplicados (fuera del alcance verificado)

- `components/ui/infinite-moving-cards.tsx:206` tiene un `text-[11px]`
  fuera de la escala tipográfica de `design.md` — preexistente, no
  tocado en este pase porque no formaba parte de los hallazgos
  auditados originalmente.
- El chevron de los `<select>` nativos en `FiltrosCatalogo` ahora se
  pinta oscuro gracias a `color-scheme: dark`, pero sigue siendo el
  triángulo por defecto del navegador — reemplazarlo por un ícono SVG
  propio sería un paso de pulido adicional, no un bug.
