// Port a JS de la rampa de color del shader "Plasma" (shaders.ts), para
// calcularla UNA vez en el CPU en vez de 5 veces por pixel por frame en la GPU.
//
// El porqué: `palette()` mezclaba las 8 paradas de color encadenando 7
// llamadas a `mixColour()`, y `mixColour()` con `u_oklab = 1.0` hace el
// viaje sRGB → lineal → OKLab → lineal → sRGB, que son ~15 `pow()` por
// llamada. Eso da ~105 `pow()` por muestra de color; y como `u_blur` está en
// 0.016, `main()` llama a `shade()` (y con él a `palette()`) 5 veces por
// pixel: ~525 `pow()` por pixel, por frame. En una pantalla 1080p con dpr 2
// son ~4.400 millones de `pow()` por frame — de ahí el congelamiento.
//
// Pero `palette(x)` es una función pura de `x`: los 8 colores y el toggle de
// OKLab son uniforms constantes durante toda la vida del canvas. O sea que
// toda esa cuenta produce siempre el mismo resultado para el mismo `x`.
// Se tabula acá en 1024 pasos, se sube como textura 1D y en el shader queda
// un `texture2D()`. El resultado en pantalla es el mismo — no es una
// aproximación de la mezcla OKLab, es exactamente la misma mezcla OKLab,
// resuelta una sola vez al iniciar en vez de millones de veces por segundo.
//
// Las funciones de abajo son la traducción literal de las de shaders.ts
// (`srgbToLinear`, `linearToSrgb`, `linToOklab`, `oklabToLin`, `mixColour`,
// `palette`), incluidos los `max()` que protegían de los NaN de `pow()` con
// negativos. Si alguna vez se toca la rampa allá, hay que tocarla acá.

export type RGB = [number, number, number];

// Ancho de la tabla. Con filtrado LINEAR, 1024 pasos dejan un error de
// interpolación muy por debajo de los 8 bits de salida — y el grano
// (`u_grain = 0.35`) es de ±45/255, así que ni en teoría puede aparecer
// banding por la cuantización de la tabla.
export const LUT_ANCHO = 1024;

function srgbALineal(c: number): number {
  return c >= 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

function linealASrgb(c: number): number {
  // Igual que en GLSL: el `max()` cubre los canales negativos que puede
  // devolver una interpolación OKLab fuera de gamut.
  return c >= 0.0031308
    ? 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055
    : c * 12.92;
}

function linAOklab(c: RGB): RGB {
  const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2];
  const m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2];
  const s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2];
  const lr = Math.pow(Math.max(l, 0), 1 / 3);
  const mr = Math.pow(Math.max(m, 0), 1 / 3);
  const sr = Math.pow(Math.max(s, 0), 1 / 3);
  return [
    0.2104542553 * lr + 0.793617785 * mr - 0.0040720468 * sr,
    1.9779984951 * lr - 2.428592205 * mr + 0.4505937099 * sr,
    0.0259040371 * lr + 0.7827717662 * mr - 0.808675766 * sr,
  ];
}

function oklabALin(c: RGB): RGB {
  let l = c[0] + 0.3963377774 * c[1] + 0.2158037573 * c[2];
  let m = c[0] - 0.1055613458 * c[1] - 0.0638541728 * c[2];
  let s = c[0] - 0.0894841775 * c[1] - 1.291485548 * c[2];
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function mezclarOklab(a: RGB, b: RGB, t: number): RGB {
  const la = linAOklab([srgbALineal(a[0]), srgbALineal(a[1]), srgbALineal(a[2])]);
  const lb = linAOklab([srgbALineal(b[0]), srgbALineal(b[1]), srgbALineal(b[2])]);
  const lin = oklabALin([
    la[0] + (lb[0] - la[0]) * t,
    la[1] + (lb[1] - la[1]) * t,
    la[2] + (lb[2] - la[2]) * t,
  ]);
  return [
    Math.min(1, Math.max(0, linealASrgb(lin[0]))),
    Math.min(1, Math.max(0, linealASrgb(lin[1]))),
    Math.min(1, Math.max(0, linealASrgb(lin[2]))),
  ];
}

/** Réplica exacta de `vec3 palette(float x)` del shader original. */
export function paleta(x: number, colores: RGB[], cantidadColores: number): RGB {
  const n = Math.max(cantidadColores - 1, 1);
  const f = Math.min(Math.max(x, 0), 1) * n;
  let col = colores[0];
  for (let i = 0; i < 7; i++) {
    if (i < n) {
      const t = Math.min(Math.max(f - i, 0), 1);
      col = mezclarOklab(col, colores[i + 1], t * t * (3 - 2 * t)); // smoothstep
    }
  }
  return col;
}

/**
 * Tabla RGBA de `LUT_ANCHO x 1` con la rampa ya resuelta.
 *
 * Cada texel guarda `paleta((i + 0.5) / LUT_ANCHO)`: el +0.5 alinea la tabla
 * con el centro del texel, que es donde cae el muestreo LINEAR de WebGL
 * cuando el shader lee en `vec2(x, 0.5)`. Sin ese medio texel la rampa
 * entera quedaría corrida medio paso.
 */
export function construirLutPaleta(colores: RGB[], cantidadColores: number): Uint8Array {
  const pixeles = new Uint8Array(LUT_ANCHO * 4);
  for (let i = 0; i < LUT_ANCHO; i++) {
    const c = paleta((i + 0.5) / LUT_ANCHO, colores, cantidadColores);
    pixeles[i * 4] = Math.round(c[0] * 255);
    pixeles[i * 4 + 1] = Math.round(c[1] * 255);
    pixeles[i * 4 + 2] = Math.round(c[2] * 255);
    pixeles[i * 4 + 3] = 255;
  }
  return pixeles;
}
