import { InfiniteMovingCards, type InfiniteMovingCardItem } from "@/components/ui/infinite-moving-cards";

// TODO(BLOQUEO): reseñas placeholder — reemplazar por las reales del
// cliente (nombre, ciudad/rol, texto y puntaje reales). Ver docs/BLOQUEOS.md.
const RESENAS: InfiniteMovingCardItem[] = [
  {
    id: 1,
    description:
      "Pedí un perfume árabe por encargo y llegó impecable. La atención por WhatsApp hizo toda la diferencia.",
    rating: 5,
    name: "Cliente Deluxx",
    role: "Compra por encargo",
  },
  {
    id: 2,
    description:
      "Probé la muestra antes de decidirme por el frasco completo — se nota que les importa que elijas bien.",
    rating: 5,
    name: "Cliente Deluxx",
    role: "Muestra + compra",
  },
  {
    id: 3,
    description: "Envío rápido y el perfume tal cual se veía en las fotos. Voy a volver a comprar.",
    rating: 5,
    name: "Cliente Deluxx",
    role: "Compra en stock",
  },
  {
    id: 4,
    description:
      "Buenísima variedad de nicho, algo que cuesta encontrar. Precio justo para la calidad.",
    rating: 4,
    name: "Cliente Deluxx",
    role: "Perfumería de nicho",
  },
  {
    id: 5,
    description: "Coordinar el pago y el envío por WhatsApp fue simple y directo, sin vueltas.",
    rating: 5,
    name: "Cliente Deluxx",
    role: "Compra por encargo",
  },
];

export default function BloqueResenas() {
  return (
    <section className="bg-surface py-10 md:py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-12 mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-on-background">
          Lo que dicen nuestros clientes
        </h2>
      </div>
      <InfiniteMovingCards items={RESENAS} speed="slow" maskColor="surface" />
    </section>
  );
}
