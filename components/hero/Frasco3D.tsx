"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import { ClampToEdgeWrapping, type Group } from "three";

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

function Ribs() {
  const ribs = useMemo(() => {
    const items: { x: number }[] = [];
    const margen = 0.06;
    const usable = ANCHO - margen * 2;
    for (let i = 0; i < N_RIBS; i++) {
      items.push({ x: -usable / 2 + (usable / (N_RIBS - 1)) * i });
    }
    return items;
  }, []);

  return (
    <>
      {ribs.map((r, i) => (
        <mesh key={i} position={[r.x, 0, PROFUNDO / 2 + 0.006]}>
          <boxGeometry args={[0.022, ALTO - 0.1, 0.014]} />
          <meshStandardMaterial color={GRIS_RIB} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {ribs.map((r, i) => (
        <mesh key={`b${i}`} position={[r.x, 0, -PROFUNDO / 2 - 0.006]}>
          <boxGeometry args={[0.022, ALTO - 0.1, 0.014]} />
          <meshStandardMaterial color={GRIS_RIB} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
    </>
  );
}

function Studs() {
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

  return (
    <>
      {posiciones.map(([x, y], i) => (
        <mesh key={i} position={[x, y, PROFUNDO / 2 + 0.01]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color={PLATA} metalness={1} roughness={0.05} />
        </mesh>
      ))}
    </>
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

export default function Frasco3D() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.9], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: "auto" }}
    >
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
