"use client";

import { InfiniteMovingCards, type InfiniteMovingCardItem } from "@/components/ui/infinite-moving-cards";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_CONFIGURADO = !!CLOUD_NAME && CLOUD_NAME !== "dxxxxxx";

// `image` guarda el public_id de Cloudinary (deluxx/testimonios/{slug}), no
// una ruta — esto no es un componente de imagen de Next (es un
// background-image plano para el recorte con background-size/position de
// renderTestimonio), así que se arma la URL de entrega a mano en vez de
// pasar por CldImage. f_auto,q_auto: formato y calidad automáticos según el
// navegador, mismo criterio que usaría next-cloudinary por defecto. Si
// Cloudinary no está configurado, cae al PNG local en public/testimonios/
// (mismos nombres de archivo, subidos ahí antes de tener cuenta).
function urlTestimonio(publicId: string) {
  if (!CLOUDINARY_CONFIGURADO) return `/testimonios/${publicId.split("/").pop()}.png`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}

// Capturas reales de reseñas de Google, provistas por el cliente
// (ver public/testimonios/ y deluxx/testimonios/ en Cloudinary).
// `description` se usa solo para el texto accesible (sr-only) — lo que se
// ve en pantalla es la imagen tal cual.
const RESENAS: InfiniteMovingCardItem[] = [
  {
    id: 1,
    image: "deluxx/testimonios/cecilia-merlo",
    name: "Cecilia Merlo",
    rating: 5,
    description:
      "Buenos precios, excelente atención y una gran variedad de fragancias para elegir.",
  },
  {
    id: 2,
    image: "deluxx/testimonios/elias-santoni",
    name: "Elías Santoni",
    rating: 5,
    description:
      "Muy recomendable. Me asesoraron para elegir un perfume sin conocer mucho del tema y acertaron completamente. Excelente calidad.",
  },
  {
    id: 3,
    image: "deluxx/testimonios/marcelo-reynoso",
    name: "Marcelo Reynoso",
    rating: 5,
    description: "Excelentes productos! Calidad y precio..muy recomendable, excelente atención!",
  },
  {
    id: 4,
    image: "deluxx/testimonios/pablo-civiriati",
    name: "Pablo Civiriati",
    rating: 5,
    description:
      "Excelentes los precios, variedad y calidad en productos! Además cuenta con buen asesoramiento, recomendando buenas fragancias y siendo pacientes con sus clientes.",
  },
  {
    id: 5,
    image: "deluxx/testimonios/pablo-savino",
    name: "Pablo Savino",
    rating: 5,
    description:
      "Atención de primera. Me recomendaron una fragancia según mis gustos y fue un acierto total. Muy buena experiencia.",
  },
  {
    id: 6,
    image: "deluxx/testimonios/seba-vagni",
    name: "Seba Vagni",
    rating: 5,
    description:
      "Muy buena atención desde el primer momento. Respondieron todas mis consultas rápidamente.",
  },
  {
    id: 7,
    image: "deluxx/testimonios/sergio-bellino",
    name: "Sergio Bellino",
    rating: 5,
    description:
      "Excelente atención, muy buenos precios y el perfume 100% originales. Quedé muy conforme con la compra, no solo los recomiendo, si no que los vuelvo a elegir!!!",
  },
  {
    id: 8,
    image: "deluxx/testimonios/sofia-gonzales",
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
  if (!r.image) return null;
  return (
    <div
      role="img"
      aria-label={`Reseña de ${r.name}`}
      className="h-56 md:h-64 rounded-sm bg-surface-raised"
      style={{
        aspectRatio: ASPECT_RATIO,
        backgroundImage: `url(${urlTestimonio(r.image)})`,
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
