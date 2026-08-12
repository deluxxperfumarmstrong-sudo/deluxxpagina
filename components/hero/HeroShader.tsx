"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { construirLutPaleta, LUT_ANCHO, type RGB } from "./paletaLut";

// Re-tinte de marca sobre el shader "Plasma" original (shaders.ts) — valores
// del §5 del PRD. 8 paradas es el máximo que soportaba el array del shader —
// ahora la rampa se resuelve en el CPU y entra como textura (ver paletaLut.ts),
// pero se conservan las 8 para no mover ni un pixel del resultado.
// u_hue = 0.0 y u_oklab = 1.0 son NO negociables: si se tocan, el rojo de
// marca sale cyan (hue) o pasa por marrones sucios en la mezcla (oklab).
// #0A0A0A (negro puro) no es un token de design.md. El extremo oscuro de la
// rampa usa `background` (#3A3A3D) — el mismo gris metálico del resto del
// sitio — en vez de negro o de surface-raised, que sigue leyendo casi negro.
// Tres paradas de gris seguidas antes del rojo y otra después: el rojo pasa
// a ocupar solo 2 de los 7 tramos de la rampa (antes eran 2 de 6), la
// fracción más angosta posible con 8 paradas — el gris domina el resto.
const COLORS: RGB[] = [
  [0.227, 0.227, 0.239], // #3A3A3D background
  [0.165, 0.165, 0.173], // #2A2A2C surface
  [0.333, 0.333, 0.353], // #55555A surface-metallic
  [0.333, 0.333, 0.353], // #55555A surface-metallic (sostiene el gris)
  [0.333, 0.333, 0.353], // #55555A surface-metallic (sostiene el gris)
  [0.831, 0.137, 0.157], // #D42328 accent — veta fina, el mínimo posible
  [0.333, 0.333, 0.353], // #55555A surface-metallic — vuelve a gris apenas pasa el rojo
  [0.929, 0.929, 0.929], // #EDEDED on-surface
];

const UNIFORMS = {
  // shape.x (escala) sube de 1.5 a 1.75: el mismo patrón se ve con ondas
  // más chicas y numerosas, así que toda veta de color —incluida la
  // roja— queda más fina en pantalla, no solo por la rampa de colores.
  shape: [1.75, 0.48, 0.5, 0.0],
  // surface.z (brillo) baja de -0.5 (preset original) a -0.12: con -0.5 el
  // shader resta 0.5 a cada canal DESPUÉS de armar la paleta, así que
  // cualquier gris de la rampa (todos < 0.5) terminaba en negro puro sin
  // importar qué color se pusiera en COLORS[0]. -0.12 mantiene algo de
  // profundidad sin aplastar los grises oscuros.
  surface: [2.4, 0.92, -0.12, 1.0],
  finish: [0.0, 0.61, 0.016, 0.35], // x = u_hue = 0.0 — no negociable (preset original: 3.04)
  transform: [7.0, 0.0, 0.16, 1.0], // w = u_oklab = 1.0 — no negociable (preset original: 0.0)
  space: [0.0, 0.0, 0.0, 0.0], // offset.xy, pointer.xy — sin cursor, sin offset
  cursor: [0.0, 4.0, 0.65, 0.3], // x = presencia = 0 → cursor off
};

// El drift (u_transform.z) desplaza el campo entero con el tiempo: es el mismo
// vector para todos los píxeles de un frame. Calcularlo por pixel era pagar dos
// transcendentales por fragmento para llegar siempre al mismo número, así que
// se resuelve una vez por frame en el CPU y viaja en u_space.xy, que el shader
// suma exactamente en el mismo punto del pipeline (el "p += u_offset" está
// justo antes del bloque de drift). Resultado idéntico, dos sin/cos menos.
const DRIFT = UNIFORMS.transform[2];
const VELOCIDAD = 0.86; // u_scene.z = segundos * 0.86, igual que el preset
const DPR_MAX = 2; // tope de devicePixelRatio pedido por el §5 del PRD

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compilando shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// --- Presupuesto de resolución -----------------------------------------------
// El shader es un fragment shader full-screen: su costo escala directo con la
// cantidad de píxeles a dibujar. Con la rampa ya tabulada ese costo por pixel
// bajó dos órdenes de magnitud, así que la enorme mayoría de los equipos corre
// a escala 1; esto es solo el techo de píxeles por frame con el que ARRANCA,
// para no regalarle el primer segundo —el único que el usuario mira de
// verdad— a un equipo que ya se sabe que no llega. Después ajusta el monitor.
const ESCALA_MIN = 0.45;

function escalaInicial(): number {
  if (typeof window === "undefined") return 1;
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
  const pixeles = window.innerWidth * window.innerHeight * dpr * dpr;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const nucleos = nav.hardwareConcurrency || 4;
  const memoria = nav.deviceMemory ?? 4;
  const tactil = window.matchMedia("(pointer: coarse)").matches;

  // Un 1080p a dpr 1 (2,07M) entra entero; recién un 4K o un retina a dpr 2
  // tocan el techo. En mobile el techo es más bajo porque el mismo panel se
  // dibuja con una GPU de una fracción de la potencia.
  let presupuesto = 4_200_000;
  if (tactil) presupuesto = 2_300_000;
  if (nucleos <= 4 || memoria <= 4) presupuesto = Math.min(presupuesto, 1_300_000);

  return Math.min(1, Math.max(ESCALA_MIN, Math.sqrt(presupuesto / pixeles)));
}

export default function HeroShader({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // alpha:false — el shader escribe siempre alpha 1.0 y el canvas va sobre
    //   un div con el mismo gris de fondo, así que el compositor puede saltear
    //   el blend por pixel de toda la pantalla sin ningún cambio visual.
    // antialias:false — acá se dibuja UN triángulo que tapa el viewport: no
    //   hay bordes de geometría que suavizar. El MSAA que venía por default
    //   multiplicaba el ancho de banda y agregaba un resolve por nada.
    // depth/stencil:false — nunca se testea ni se escribe profundidad.
    // Los tres son ahorro puro: ni un pixel distinto en pantalla.
    const opciones: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    };
    const gl = (canvas.getContext("webgl", opciones) ||
      canvas.getContext("experimental-webgl", opciones)) as WebGLRenderingContext | null;

    if (!gl) {
      setWebglOk(false);
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      setWebglOk(false);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Error linkeando programa:", gl.getProgramInfoLog(program));
      setWebglOk(false);
      return;
    }
    gl.useProgram(program);
    // Ya linkeado, los objetos de shader solo mantienen viva memoria del
    // compilador: el programa no los necesita más.
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    // Triángulo fullscreen (sin librerías): un solo triángulo que cubre
    // de sobra el viewport, más barato que un quad de 2 triángulos.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // La rampa de 8 paradas mezclada en OKLab, resuelta una sola vez acá y
    // subida como textura de 1024x1. Antes esta misma cuenta corría 5 veces
    // por pixel y por frame adentro del fragment shader (ver shaders.ts).
    const lutTextura = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lutTextura);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      LUT_ANCHO,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      construirLutPaleta(COLORS, 8)
    );
    // LINEAR: interpola entre pasos de la tabla, así la rampa sigue siendo
    // continua y no aparecen escalones. CLAMP_TO_EDGE: sin repetición en los
    // extremos, que es lo que hacía el clamp(x, 0, 1) del shader.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const u_scene = gl.getUniformLocation(program, "u_scene");
    const u_space = gl.getUniformLocation(program, "u_space");

    gl.uniform1i(gl.getUniformLocation(program, "u_paletteLut"), 0);
    gl.uniform4fv(gl.getUniformLocation(program, "u_shape"), UNIFORMS.shape);
    gl.uniform4fv(gl.getUniformLocation(program, "u_surface"), UNIFORMS.surface);
    gl.uniform4fv(gl.getUniformLocation(program, "u_finish"), UNIFORMS.finish);
    gl.uniform4fv(gl.getUniformLocation(program, "u_cursor"), UNIFORMS.cursor);
    // El drift viaja por u_space.xy desde el CPU, así que el del shader se
    // apaga (índice 2 en 0) — ver la constante DRIFT arriba.
    gl.uniform4f(
      gl.getUniformLocation(program, "u_transform"),
      UNIFORMS.transform[0],
      UNIFORMS.transform[1],
      0,
      UNIFORMS.transform[3]
    );

    let rafId = 0;
    let running = true;
    let inView = true;
    const inicio = performance.now();

    // --- Tamaño del drawing buffer -------------------------------------------
    // clientWidth/clientHeight fuerzan un layout sincrónico. Leerlos adentro
    // del loop (que es lo que se hacía) significaba un reflow por frame,
    // intercalado con el scroll del usuario: el navegador tenía que recalcular
    // el layout de la página entera 60 veces por segundo mientras scrolleaba.
    // Ese era el otro motivo del "se congela", aparte del costo del shader.
    // Ahora se lee una sola vez acá y después solo cuando el ResizeObserver
    // avisa que cambió de verdad — sus callbacks llegan con las medidas ya
    // calculadas por el navegador, sin forzar nada.
    let anchoCss = canvas.clientWidth;
    let altoCss = canvas.clientHeight;
    let pendienteResize = true;
    let escala = escalaInicial();

    function aplicarTamano() {
      if (!pendienteResize) return;
      pendienteResize = false;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX) * escala;
      const ancho = Math.max(1, Math.round(anchoCss * dpr));
      const alto = Math.max(1, Math.round(altoCss * dpr));
      if (canvas!.width !== ancho || canvas!.height !== alto) {
        canvas!.width = ancho;
        canvas!.height = alto;
        gl!.viewport(0, 0, ancho, alto);
      }
    }

    function dibujar(segundos: number) {
      aplicarTamano();
      const t = segundos * VELOCIDAD;
      gl!.uniform4f(u_scene, canvas!.width, canvas!.height, t, 8.0);
      gl!.uniform4f(u_space, DRIFT * Math.sin(t * 0.31), DRIFT * Math.cos(t * 0.23), 0, 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    // --- Monitor de rendimiento ----------------------------------------------
    // Se mide por ventana de TIEMPO, no de frames. La versión anterior
    // promediaba cada 45 frames: en el equipo que anda a 8 fps —justo el caso
    // para el que existe— 45 frames son 5,6 segundos, y como bajaba de a un
    // escalón fijo tardaba ~17 segundos en llegar al piso. Para entonces el
    // usuario ya pasó el hero. Cuanto más lento el equipo, más tardaba en
    // reaccionar: exactamente al revés de lo que hace falta. Con ventana de
    // 400 ms, un equipo a 8 fps reacciona a los 3 frames.
    const VENTANA_MS = 400;
    const OBJETIVO_MS = 16.7; // 60 fps
    const LENTO_MS = 21; // por debajo de ~48 fps sostenidos hay que bajar
    const RAPIDO_MS = 13.5; // por encima de ~74 fps sobra margen para recuperar
    const VENTANAS_TIBIAS = 2; // ~800 ms de gracia: hidratación, parse de chunks, primer compile
    const RECUPERACIONES_MAX = 2;

    let ventanaInicio = 0;
    let framesVentana = 0;
    let ventanasVistas = 0;
    let ventanasRapidas = 0;
    let recuperaciones = 0;
    let intervaloMin = 0; // 0 = sin tope de cadencia
    let ultimoDibujo = 0;

    function medirYAjustar(now: number) {
      if (ventanaInicio === 0) {
        ventanaInicio = now;
        return;
      }
      framesVentana++;
      const transcurrido = now - ventanaInicio;
      if (transcurrido < VENTANA_MS) return;

      const msPorFrame = transcurrido / framesVentana;
      ventanaInicio = now;
      framesVentana = 0;
      ventanasVistas++;

      // El arranque en frío mide la hidratación de React y el parse de los
      // chunks, no la GPU: degradar por eso sería castigar a un equipo sano.
      if (ventanasVistas <= VENTANAS_TIBIAS) return;
      // Con tope de cadencia puesto, los frames salteados falsean la medición.
      if (intervaloMin > 0) return;

      if (msPorFrame > LENTO_MS) {
        ventanasRapidas = 0;
        if (escala > ESCALA_MIN) {
          // Corrección proporcional en un solo paso: el costo es lineal en
          // píxeles y los píxeles van con el cuadrado de la escala, así que
          // para pasar de msPorFrame a OBJETIVO_MS hay que multiplicar la
          // escala por la raíz del cociente. El min() garantiza que siempre
          // baje algo, aunque la cuenta dé un ajuste ínfimo.
          escala = Math.max(
            ESCALA_MIN,
            Math.min(escala - 0.08, escala * Math.sqrt(OBJETIVO_MS / msPorFrame))
          );
          pendienteResize = true;
          // Ya se comprobó que este equipo no da: no volver a subir, para no
          // quedar oscilando entre nítido-y-trabado y borroso-y-fluido.
          recuperaciones = RECUPERACIONES_MAX;
        } else {
          // Piso de resolución y todavía no alcanza. El último escalón baja la
          // cadencia, no la nitidez: en un plasma que se mueve así de lento
          // 30 fps es imperceptible, y liberar la mitad de los frames le
          // devuelve a la GPU el aire que el scroll necesita para ir fluido.
          intervaloMin = 1000 / 30;
        }
        return;
      }

      // Recuperación: el techo inicial se elige por señales del dispositivo,
      // que son una estimación. Si el equipo demuestra que le sobra, se le
      // devuelve nitidez. Solo aplica si nunca hubo que bajar de verdad.
      if (msPorFrame < RAPIDO_MS && escala < 1 && recuperaciones < RECUPERACIONES_MAX) {
        ventanasRapidas++;
        if (ventanasRapidas >= 4) {
          escala = Math.min(1, escala + 0.08);
          pendienteResize = true;
          ventanasRapidas = 0;
          recuperaciones++;
        }
      } else {
        ventanasRapidas = 0;
      }
    }

    function programar() {
      if (running && inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function frame(now: number) {
      if (!running) return;

      // Tope de cadencia (último escalón del degradado): se saltea el dibujo
      // pero se sigue pidiendo rAF para no perder el hilo del loop.
      if (intervaloMin > 0 && now - ultimoDibujo < intervaloMin - 1) {
        programar();
        return;
      }
      ultimoDibujo = now;

      dibujar((now - inicio) / 1000);
      medirYAjustar(now);
      programar();
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (running && inView) {
        // Al volver de una pestaña en segundo plano el primer delta es enorme
        // y no dice nada del rendimiento: se descarta la ventana en curso.
        ventanaInicio = 0;
        framesVentana = 0;
        cancelAnimationFrame(rafId);
        programar();
      }
    }

    // El Hero solo ocupa el primer tramo de la página — sin esto, el rAF
    // del shader seguía dibujando cada frame (WebGL + GPU) durante el
    // resto de la sesión aunque el usuario ya hubiera scrolleado varias
    // pantallas de distancia y el canvas ni siquiera fuera visible. Era
    // el gasto más grande de todo el sitio en desktop.
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        cancelAnimationFrame(rafId);
        if (inView) {
          ventanaInicio = 0;
          framesVentana = 0;
          programar();
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver((entradas) => {
      const entrada = entradas[0];
      const caja = entrada.contentBoxSize?.[0];
      anchoCss = caja ? caja.inlineSize : entrada.contentRect.width;
      altoCss = caja ? caja.blockSize : entrada.contentRect.height;
      pendienteResize = true;
    });
    ro.observe(canvas);

    // El ResizeObserver no se entera si cambia el devicePixelRatio sin que
    // cambie el tamaño CSS (mover la ventana a un monitor con otra densidad).
    // Este listener no lee layout, solo levanta la bandera.
    const alResize = () => {
      pendienteResize = true;
    };

    programar();

    window.addEventListener("resize", alResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", alResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Sin esto el contexto WebGL, su programa y su textura sobrevivían a la
      // navegación cliente de Next: salir del home y volver iba dejando
      // contextos colgados, y el navegador solo permite un puñado por página.
      gl.deleteTexture(lutTextura);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#3A3A3D]">
      {webglOk ? (
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: "linear-gradient(135deg, #3A3A3D 0%, #55555A 100%)",
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
