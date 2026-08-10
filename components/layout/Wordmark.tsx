import Link from "next/link";
import Image from "next/image";

// Misma placa PNG que se usa como etiqueta del frasco 3D del hero
// (ver Frasco3D.tsx) — el logo real de la marca, no una recreación en texto.
// El contenido visible ocupa solo una franja angosta y centrada del PNG
// cuadrado de 500x500 (medido: x 105–394, y 209–300) — el aspect-ratio del
// contenedor recorta el resto con object-cover en vez de dejar aire arriba
// y abajo.
export default function Wordmark({ size = "sm", className }: { size?: "sm" | "lg"; className?: string }) {
  const width = size === "lg" ? 220 : 130;
  return (
    // `className`, cuando viene, reemplaza el display por defecto en vez de
    // sumarse — "inline-block" + "hidden md:inline-block" en la misma
    // clase compiten por la misma propiedad CSS y el orden en el stylesheet
    // de Tailwind (no el orden en el atributo class) decide cuál gana, así
    // que un merge silencioso puede dejar el "hidden" sin efecto.
    <Link href="/" className={className ?? "inline-block"} style={{ width }}>
      <span className="relative block w-full aspect-[16/5]">
        <Image
          src="/deluxx-logo-placa.png"
          alt="Deluxx Perfum"
          fill
          sizes={`${width}px`}
          className="object-cover object-center"
        />
      </span>
    </Link>
  );
}
