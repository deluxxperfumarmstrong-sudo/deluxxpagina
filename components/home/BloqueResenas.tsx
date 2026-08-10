"use client";

import { InfiniteMovingCards, type InfiniteMovingCardItem } from "@/components/ui/infinite-moving-cards";

// Capturas reales de reseñas de Google, provistas por el cliente
// (ver public/testimonios/). `description` se usa solo para el texto
// accesible (sr-only) — lo que se ve en pantalla es la imagen tal cual.
const RESENAS: InfiniteMovingCardItem[] = [
  {
    id: 1,
    image: "/testimonios/cecilia-merlo.png",
    name: "Cecilia Merlo",
    rating: 5,
    description:
      "Buenos precios, excelente atención y una gran variedad de fragancias para elegir.",
  },
  {
    id: 2,
    image: "/testimonios/elias-santoni.png",
    name: "Elías Santoni",
    rating: 5,
    description:
      "Muy recomendable. Me asesoraron para elegir un perfume sin conocer mucho del tema y acertaron completamente. Excelente calidad.",
  },
  {
    id: 3,
    image: "/testimonios/marcelo-reynoso.png",
    name: "Marcelo Reynoso",
    rating: 5,
    description: "Excelentes productos! Calidad y precio..muy recomendable, excelente atención!",
  },
  {
    id: 4,
    image: "/testimonios/pablo-civiriati.png",
    name: "Pablo Civiriati",
    rating: 5,
    description:
      "Excelentes los precios, variedad y calidad en productos! Además cuenta con buen asesoramiento, recomendando buenas fragancias y siendo pacientes con sus clientes.",
  },
  {
    id: 5,
    image: "/testimonios/pablo-savino.png",
    name: "Pablo Savino",
    rating: 5,
    description:
      "Atención de primera. Me recomendaron una fragancia según mis gustos y fue un acierto total. Muy buena experiencia.",
  },
  {
    id: 6,
    image: "/testimonios/seba-vagni.png",
    name: "Seba Vagni",
    rating: 5,
    description:
      "Muy buena atención desde el primer momento. Respondieron todas mis consultas rápidamente.",
  },
  {
    id: 7,
    image: "/testimonios/sergio-bellino.png",
    name: "Sergio Bellino",
    rating: 5,
    description:
      "Excelente atención, muy buenos precios y el perfume 100% originales. Quedé muy conforme con la compra, no solo los recomiendo, si no que los vuelvo a elegir!!!",
  },
  {
    id: 8,
    image: "/testimonios/sofia-gonzales.png",
    name: "Sofía González",
    rating: 5,
    description:
      "Excelente calidad de producto y muy buena atención. Entrega en tiempo y forma, súper recomendable!",
  },
];

// Las 8 capturas son PNG de 590x381, la tarjeta blanca ocupa el canvas
// completo de punta a punta (solo las esquinas redondeadas del cliente
// quedan fuera, como triángulos oscuros de ~20px) — a diferencia de la
// tanda anterior (590x472 con la tarjeta centrada sobre fondo negro), acá
// no hace falta recortar nada: el aspect-ratio del contenedor ya coincide
// con el de la imagen, así que "cover" no recorta de más y el
// rounded-sm del contenedor tapa esas esquinas oscuras de origen.
const ASPECT_RATIO = "590 / 381";

function renderTestimonio(r: InfiniteMovingCardItem) {
  return (
    <div
      role="img"
      aria-label={`Reseña de ${r.name}`}
      className="h-56 md:h-64 rounded-sm bg-surface-raised"
      style={{
        aspectRatio: ASPECT_RATIO,
        backgroundImage: `url(${r.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

export default function BloqueResenas() {
  return (
    <section className="bg-surface py-10 md:py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-12 mb-3 md:mb-4">
        <h2 className="font-display text-3xl md:text-4xl text-on-background">
          Lo que dicen nuestros clientes
        </h2>
      </div>

      {/* El carrusel duplica cada reseña para el loop visual y se marca
          aria-hidden — esta lista, oculta visualmente, es la que
          escuchan los lectores de pantalla (mismo patrón que CintaBeneficios). */}
      <ul className="sr-only">
        {RESENAS.map((r) => (
          <li key={r.id}>
            {r.name}: {r.description} ({r.rating} de 5 estrellas)
          </li>
        ))}
      </ul>

      <InfiniteMovingCards
        items={RESENAS}
        speed="slow"
        maskColor="surface"
        renderItem={renderTestimonio}
      />
    </section>
  );
}
