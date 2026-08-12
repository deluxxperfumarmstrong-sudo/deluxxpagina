"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor, RoundedBox, useTexture } from "@react-three/drei";
import { ClampToEdgeWrapping, Matrix4, type Group, type InstancedMesh } from "three";

// Frasco rectangular acanalado (referencia: Lattafa "Kingdom"), pero en los
// grises metálicos de design.md en vez de dorado — nada de un segundo color
// de acento: el rojo que aparece viene únicamente del logo real, no de una
// pieza pintada. Todo armado con primitivas, sin modelo .glb.

const GRIS_CUERPO = "#1C1C1E"; // casi negro, más oscuro que cualquier token de design.md a propósito
const GRIS_RIB = "#4A4A4E"; // sutil, no plateado — solo insinúa el acanalado
const GRIS_METAL = "#3A3A3D"; // background — tapa, base y placa del logo
const PLATA = "#8A8A90"; // studs, discretos, sin brillo plateado fuerte

const ANCHO = 1.0;
const ALTO = 1.5;
const PROFUNDO = 0.5;
const N_RIBS = 20;

// La tapa suma más altura arriba (0.47) de lo que la base resta abajo
// (0.03), así que el centro geométrico real del objeto NO es y=0 — está
// corrido 0.22 hacia arriba. Sin corregir esto, la cámara (que apunta al
// origen) encuadra mal y corta la tapa por arriba. Ver <ContenidoCentrado>.
const CENTRO_Y = 0.22;

// Las 40 canaletas y los 20 studs son, cada grupo, la misma geometría con el
// mismo material repetida en distintas posiciones — el caso exacto para el que
// existe InstancedMesh. Antes eran 60 objetos sueltos, o sea 60 draw calls con
// sus 60 subidas de uniforms por frame, más que todo el resto del frasco
// junto; ahora son 2 draw calls. En una GPU de escritorio es un ahorro
// moderado, en un Android de gama media es la diferencia entre alcanzar los
// 60 fps y no. No cambia un pixel de lo que se ve.
function Ribs() {
  const ref = useRef<InstancedMesh>(null);
  const total = N_RIBS * 2;

  useLayoutEffect(() => {
    const malla = ref.current;
    if (!malla) return;
    const m = new Matrix4();
    const margen = 0.06;
    const usable = ANCHO - margen * 2;
    let i = 0;
    // Mismo orden que antes: primero la cara de adelante, después la de atrás.
    for (const z of [PROFUNDO / 2 + 0.006, -PROFUNDO / 2 - 0.006]) {
      for (let k = 0; k < N_RIBS; k++) {
        m.makeTranslation(-usable / 2 + (usable / (N_RIBS - 1)) * k, 0, z);
        malla.setMatrixAt(i++, m);
      }
    }
    malla.instanceMatrix.needsUpdate = true;
  }, []);

  // frustumCulled={false}: la esfera envolvente de un InstancedMesh se calcula
  // en el primer test de culling, que puede caer antes de que se escriban las
  // matrices. Al ser una pieza chica de un objeto que siempre está en cámara,
  // saltear el test es más barato y más seguro que arriesgar un culleo mal
  // calculado que haga desaparecer las canaletas.
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]} frustumCulled={false}>
      <boxGeometry args={[0.022, ALTO - 0.1, 0.014]} />
      <meshStandardMaterial color={GRIS_RIB} metalness={0.85} roughness={0.25} />
    </instancedMesh>
  );
}

function Studs() {
  const ref = useRef<InstancedMesh>(null);
  const posiciones = useMemo(() => {
    const pts: [number, number][] = [];
    const xHalf = ANCHO / 2 - 0.04;
    const yHalf = ALTO / 2 - 0.04;
    const pasoX = (xHalf * 2) / 4;
    const pasoY = (yHalf * 2) / 6;
    for (let i = 0; i <= 4; i++) {
      pts.push([-xHalf + pasoX * i, yHalf]);
      pts.push([-xHalf + pasoX * i, -yHalf]);
    }
    for (let i = 1; i < 6; i++) {
      pts.push([-xHalf, -yHalf + pasoY * i]);
      pts.push([xHalf, -yHalf + pasoY * i]);
    }
    return pts;
  }, []);

  useLayoutEffect(() => {
    const malla = ref.current;
    if (!malla) return;
    const m = new Matrix4();
    posiciones.forEach(([x, y], i) => {
      m.makeTranslation(x, y, PROFUNDO / 2 + 0.01);
      malla.setMatrixAt(i, m);
    });
    malla.instanceMatrix.needsUpdate = true;
  }, [posiciones]);

  // 12x8 segmentos en vez de 16x16: son bolitas de radio 0.028 sobre un frasco
  // de ancho 1.0, o sea unos 8 px en pantalla. 512 triángulos para 8 px no se
  // distinguen de 120 ni con la nariz pegada al monitor.
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, posiciones.length]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.028, 12, 8]} />
      <meshStandardMaterial color={PLATA} metalness={1} roughness={0.05} />
    </instancedMesh>
  );
}

// Bounding box real del wordmark dentro del PNG (medido con sharp sobre el
// canal alfa: el archivo es un cuadrado de 500x500 con muchísimo margen
// transparente arriba/abajo). Recortamos la textura a esa franja en vez de
// estirar el cuadrado completo, así el logo se lee grande de verdad.
const CROP = { u0: 0.18, u1: 0.818, v0: 0.37, v1: 0.612 };
const CROP_ANCHO = CROP.u1 - CROP.u0;
const CROP_ALTO = CROP.v1 - CROP.v0;
const PLACA_ANCHO = 0.82;
const PLACA_ALTO = PLACA_ANCHO * (CROP_ALTO / CROP_ANCHO);

function PlacaLogo({ cara }: { cara: "frente" | "atras" }) {
  // PNG con fondo transparente (el isotipo real, DELUXX blanco + PERFUM
  // rojo con flourish) — se ve como grabado directo sobre el metal, no como
  // una placa rectangular pegada encima. Va también en la cara de atrás,
  // rotada 180° para que el texto no salga espejado.
  const textura = useTexture("/deluxx-logo-placa.png");

  useEffect(() => {
    textura.wrapS = ClampToEdgeWrapping;
    textura.wrapT = ClampToEdgeWrapping;
    textura.offset.set(CROP.u0, CROP.v0);
    textura.repeat.set(CROP_ANCHO, CROP_ALTO);
    textura.needsUpdate = true;
  }, [textura]);

  return (
    <group rotation={[0, cara === "atras" ? Math.PI : 0, 0]}>
      {/* Fondo liso detrás del logo, para que se lea sobre las canaletas */}
      <RoundedBox
        args={[PLACA_ANCHO + 0.08, PLACA_ALTO + 0.1, 0.012]}
        radius={0.02}
        smoothness={4}
        position={[0, 0, PROFUNDO / 2 + 0.01]}
      >
        <meshStandardMaterial color={GRIS_METAL} metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, PROFUNDO / 2 + 0.018]}>
        <planeGeometry args={[PLACA_ANCHO, PLACA_ALTO]} />
        <meshStandardMaterial
          map={textura}
          transparent
          alphaTest={0.1}
          metalness={0.1}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Frasco({ autoRotar }: { autoRotar: boolean }) {
  const grupoRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (autoRotar && grupoRef.current) {
      grupoRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={grupoRef} scale={0.88}>
      {/* Todo el contenido va corrido -CENTRO_Y para que el centro visual
          real del objeto (no el centro del cuerpo solo) quede en y=0, que
          es a donde apunta la cámara. */}
      <group position={[0, -CENTRO_Y, 0]}>
        {/* Cuerpo */}
        <RoundedBox args={[ANCHO, ALTO, PROFUNDO]} radius={0.035} smoothness={4}>
          <meshStandardMaterial color={GRIS_CUERPO} metalness={0.6} roughness={0.35} />
        </RoundedBox>

        <Ribs />
        <Studs />
        <Suspense fallback={null}>
          <PlacaLogo cara="frente" />
          <PlacaLogo cara="atras" />
        </Suspense>

        {/* Cuello */}
        <mesh position={[0, ALTO / 2 + 0.09, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.18, 24]} />
          <meshStandardMaterial color={GRIS_METAL} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Tapa */}
        <RoundedBox
          args={[0.44, 0.3, 0.28]}
          radius={0.03}
          smoothness={4}
          position={[0, ALTO / 2 + 0.32, 0]}
        >
          <meshStandardMaterial color={GRIS_METAL} metalness={0.75} roughness={0.25} />
        </RoundedBox>

        {/* Base */}
        <mesh position={[0, -ALTO / 2 - 0.015, 0]}>
          <boxGeometry args={[ANCHO - 0.02, 0.03, PROFUNDO - 0.02]} />
          <meshStandardMaterial color={GRIS_METAL} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// El dpr con el que conviene arrancar. Ojo con el valor anterior: era un 2
// literal, no "el dpr del monitor con tope 2" como decía el comentario — y el
// prop dpr de R3F es la densidad final, no un tope. O sea que en un monitor
// 1080p común (dpr 1) el frasco se dibujaba a 2x y se bajaba a 1x al
// componer: 4 veces los píxeles necesarios, con su MSAA encima, tirados a la
// basura en todas las PCs de pantalla no-retina. Ahora sí es el dpr real,
// capado a 2, y un escalón más abajo en equipos que se sabe que van justos.
const DPR_TOPE = 2;

function dprMaximo() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, DPR_TOPE);
}

function dprInicial() {
  if (typeof window === "undefined") return 1;
  const max = dprMaximo();
  const tactil = window.matchMedia("(pointer: coarse)").matches;
  const nucleos = navigator.hardwareConcurrency || 4;
  if (tactil || nucleos <= 4) return Math.min(max, 1.5);
  return max;
}

export default function Frasco3D({ activo = true }: { activo?: boolean }) {
  // PerformanceMonitor ajusta de a un escalón de 0.5 según lo que mida en este
  // equipo puntual — nunca toca la velocidad de la rotación (esa va por delta
  // time, no por fps), solo la cantidad de píxeles a dibujar por frame.
  const [dpr, setDpr] = useState(dprInicial);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 3.9], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: "auto" }}
      // "never" corta por completo el render loop de R3F (y con él,
      // useFrame de <Frasco> que hace girar el frasco) mientras el Hero
      // no está en viewport — ver Frasco3DOverlay. No afecta la rotación
      // ni ningún otro movimiento mientras el canvas SÍ está a la vista.
      frameloop={activo ? "always" : "never"}
    >
      {/* onIncline es la contracara del arranque conservador de dprInicial:
          si el equipo demuestra que le sobra margen, se le devuelve nitidez
          hasta el dpr real del monitor. flipflops={2} corta la oscilación —
          después de dos idas y vueltas se queda en el piso y no mide más. */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.5))}
        onIncline={() => setDpr((d) => Math.min(dprMaximo(), d + 0.5))}
        onFallback={() => setDpr(1)}
        flipflops={2}
      />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.5} />
      <directionalLight position={[-3, 1, -2]} intensity={0.5} />
      <pointLight position={[0, -1.5, 2]} intensity={0.35} color="#EDEDED" />

      <Suspense fallback={null}>
        <Frasco autoRotar />
      </Suspense>

      <OrbitControls
        enableZoom
        minDistance={2.6}
        maxDistance={5.5}
        enablePan={false}
        rotateSpeed={0.7}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
