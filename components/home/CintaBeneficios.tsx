import { ENVIOS, PAGOS } from "@/lib/config";

// Frases derivadas directo de las reglas de negocio (PRD) — nada inventado:
// envío a todo el país (regla 4), los 3 métodos de pago (regla 5), muestras
// (regla 7), encargo/stock (regla 1).
const FRASES = [
  "Envíos a todo el país",
  `Aceptamos ${PAGOS.metodos.join(", ")}`,
  "Muestras disponibles antes de comprar",
  `Envío en el día en ${ENVIOS.ciudadZona}`,
  "Despacho en menos de 24 hs hábiles",
];

function Tanda() {
  return (
    <div className="flex items-center shrink-0" aria-hidden="true">
      {FRASES.map((frase, i) => (
        <span key={i} className="flex items-center shrink-0">
          <span className="font-[var(--font-body)] font-semibold uppercase tracking-wide text-sm md:text-base text-on-primary px-6 md:px-8 whitespace-nowrap">
            {frase}
          </span>
          <span className="text-accent text-lg" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export default function CintaBeneficios() {
  return (
    <div className="relative bg-primary border-y border-border-subtle py-3 md:py-4 overflow-hidden">
      <span className="sr-only">
        {FRASES.join(". ")}. {/* contenido real para lectores de pantalla */}
      </span>
      <div className="flex w-max motion-safe:animate-[marquee_28s_linear_infinite] motion-reduce:animate-none">
        <Tanda />
        <Tanda />
      </div>
    </div>
  );
}
