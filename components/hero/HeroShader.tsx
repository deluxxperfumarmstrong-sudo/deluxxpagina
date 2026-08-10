"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

// Re-tinte de marca sobre el shader "Plasma" original (shaders.ts, sin
// modificar) — valores del §5 del PRD. u_colors[8] es el máximo que soporta
// el shader (array fijo en GLSL) — acá se usan las 8 paradas disponibles,
// el máximo margen posible para angostar el rojo sin tocar shaders.ts.
// u_hue = 0.0 y u_oklab = 1.0 son NO negociables: si se tocan, el rojo de
// marca sale cyan (hue) o pasa por marrones sucios en la mezcla (oklab).
// #0A0A0A (negro puro) no es un token de design.md. El extremo oscuro de la
// rampa usa `background` (#3A3A3D) — el mismo gris metálico del resto del
// sitio — en vez de negro o de surface-raised, que sigue leyendo casi negro.
// Tres paradas de gris seguidas antes del rojo y otra después: el rojo pasa
// a ocupar solo 2 de los 7 tramos de la rampa (antes eran 2 de 6), la
// fracción más angosta posible con 8 paradas — el gris domina el resto.
const COLORS: [number, number, number][] = [
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

export default function HeroShader({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

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

    const u_scene = gl.getUniformLocation(program, "u_scene");
    const u_colors = gl.getUniformLocation(program, "u_colors");
    const u_shape = gl.getUniformLocation(program, "u_shape");
    const u_surface = gl.getUniformLocation(program, "u_surface");
    const u_finish = gl.getUniformLocation(program, "u_finish");
    const u_transform = gl.getUniformLocation(program, "u_transform");
    const u_space = gl.getUniformLocation(program, "u_space");
    const u_cursor = gl.getUniformLocation(program, "u_cursor");

    gl.uniform3fv(u_colors, new Float32Array(COLORS.flat()));
    gl.uniform4fv(u_shape, UNIFORMS.shape);
    gl.uniform4fv(u_surface, UNIFORMS.surface);
    gl.uniform4fv(u_finish, UNIFORMS.finish);
    gl.uniform4fv(u_transform, UNIFORMS.transform);
    gl.uniform4fv(u_space, UNIFORMS.space);
    gl.uniform4fv(u_cursor, UNIFORMS.cursor);

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    let running = true;
    const startTime = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(canvas!.clientWidth * dpr);
      const height = Math.floor(canvas!.clientHeight * dpr);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
        gl!.viewport(0, 0, width, height);
      }
    }

    function draw(seconds: number) {
      resize();
      gl!.uniform4f(u_scene, canvas!.width, canvas!.height, seconds * 0.86, 8.0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    function frame() {
      if (!running) return;
      const seconds = (performance.now() - startTime) / 1000;
      draw(seconds);
      if (!document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (running && !reducedMotion) {
        rafId = requestAnimationFrame(frame);
      }
    }

    if (reducedMotion) {
      draw(0);
    } else {
      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
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
