# Plan de mejora UI/UX — Deluxx Perfum

Generado con las skills instaladas `impeccable` (audit/critique/craft-floor),
`emilkowalski/skill` (craft, apple-design, animate) y `Leonxlnx/taste-skill`
(taste, anti-patrones genéricos). El proyecto ya tiene un design system propio
en `docs/design.md` — ese documento es la autoridad de estilo; estas mejoras
lo respetan y, donde algo lo viola, corrigen la implementación para que
vuelva a cumplirlo.

**Pase 2 (adapt.md, mobile-first):** revisión dedicada del sitio en
375px, el viewport que más tráfico recibe. Ver [SUMMARY.md](SUMMARY.md#pase-2--auditoría-específica-mobile-localhost53872-viewport-375×812)
para el hallazgo raíz (colisión entre la escala de spacing editorial y
las utilidades numéricas de Tailwind) y todos los fixes derivados.

## Método

1. `node .claude/skills/impeccable/scripts/context.mjs` para cargar
   PRODUCT/DESIGN context → confirmó que no hay PRODUCT.md pero que el
   código + `docs/design.md` son autoridad válida para refinamiento
   (`SCOPED_EXISTING_ALLOWED`), sin bloquear en `/impeccable init`.
2. Lectura completa de `docs/design.md` (paleta, tipografía, spacing,
   shapes, componentes, do's/don'ts) y del `craft-floor` (contraste,
   spacing, type, motion, states, refuse-list: kickers, cards genéricas,
   rounded-full fuera de chip-tag, etc.)
3. Recorrida de todos los componentes y páginas (`app/**`, `components/**`,
   `lib/**`) comparando contra ese estándar + checklist de audit.md
   (a11y, performance, theming, responsive, implementation integrity).
4. Verificación numérica de contraste (WCAG) con un script node (fórmula
   de luminancia relativa) para no reportar falsos positivos.

## Hallazgos verificados (por severidad)

**P0/P1 — Accesibilidad (contraste real, no estimado)**
- `text-accent` (#D42328) usado como texto/borde en reposo sobre
  `background`/`surface` da **2.20:1 / 2.64:1** — falla WCAG AA (4.5:1).
  Afecta: botones outline (Hero "Pedir muestra", "Ir a soporte"),
  `BadgeMuestra`, badge inline de `/muestras`, links "Ver todo/Ver
  detalles", texto de "seña" en carrito/ficha de producto. El accent
  funciona bien como *fill* (fondo rojo + texto blanco, 5.16:1) pero no
  como texto/borde directo sobre el gris base.
- Botón "Agregado ✓" (`FichaProducto`) usa `bg-success` (#3EA05B) +
  `text-on-accent` (blanco) → **3.29:1**, falla AA.
- Botones de cantidad (carrito 32×40px, ficha 40×48px) no llegan al
  target táctil mínimo de 44×44px.

**P1 — Consistencia de design system (implementation integrity)**
- `text-caption` y `chip-tag` se usan como clases en 6+ archivos pero
  **no están definidas** en `globals.css` (Tailwind v4 las ignora en
  silencio) — el texto no recibe la tipografía `caption` que dicta
  `design.md`, y el chip no tiene un punto único de verdad.
- 5 badges de ícono (`BloqueEnviosPagos` ×2, `/quienes-somos`,
  `/envios-y-pagos` ×2) usan `rounded-full`, pero `design.md` es
  explícito: *"rounded.full exists only for small tag/chip elements...
  should never be used on primary surfaces"*.

**P2 — Craft-floor (patrones a evitar por defecto)**
- Kicker/eyebrow ("Ayuda", "Deluxx Perfum", "Cómo comprar") arriba del
  H1 en `/soporte`, `/quienes-somos`, `/envios-y-pagos` — el craft-floor
  lo marca como ban explícito, no como default: "no brief earns it
  back". El H1 ya comunica lo mismo.

**P3 — Microinteracción**
- El menú móvil (`MenuMovil`) no cierra con click afuera ni con Escape,
  y no tiene backdrop — usable pero por debajo del estándar del resto
  del sitio (que sí cuida foco/teclado en selects, acordeón, stepper).

## Fuera de alcance / no tocar

- Paleta, tipografía base, spacing scale, sharp corners: ya cumplen
  `design.md` y están bien ejecutados — no se reinventa el sistema.
- Contenido de reseñas placeholder (`docs/BLOQUEOS.md` ya lo marca como
  pendiente del cliente, no es un problema de UI).
- Admin panel: funcional y consistente (`campo-admin`), se deja igual
  salvo que algún fix transversal (ej. accent-text) lo toque de paso.

## Orden de ejecución (un commit por mejora)

1. Definir `--color-accent-text` (rojo aclarado, verificado ≥4.5:1 sobre
   `background` y `surface`) + documentar en `docs/design.md`.
2. Aplicar `accent-text` a los usos de accent-como-texto/borde en reposo
   listados arriba (mantener `--color-accent` como fill en hover/backgrounds,
   donde ya cumple contraste).
3. Arreglar contraste del estado "Agregado" en `FichaProducto`.
4. Definir `.text-caption` y `.chip-tag` como clases reales en
   `globals.css`, alineadas 1:1 con `design.md`, y limpiar duplicación.
5. `rounded-full` → `rounded-sm` en los 5 badges de ícono.
6. Quantity steppers a 44×44px mínimo (carrito y ficha de producto).
7. Quitar los 3 kickers/eyebrows sobre H1.
8. Mejorar `MenuMovil`: backdrop, cierre con click afuera/Escape.
9. `SUMMARY.md` final con estado y capturas de decisiones.

Cada paso es un commit separado y reversible. Si en el camino aparece
algo nuevo, se agrega acá antes de aplicarlo.
