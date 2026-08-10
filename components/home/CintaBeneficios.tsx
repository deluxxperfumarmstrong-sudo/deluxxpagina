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
          <span className="font-[var(--font-body)] font-semibold uppercase tracking-wide text-xs md:text-sm text-on-primary px-5 md:px-6 whitespace-nowrap">
            {frase}
          </span>
          <span className="text-accent text-base" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </div>
  );
}

// Sticky: se fija justo debajo del header (fixed) y queda a la vista
// mientras se hace scroll por Categorías y Destacados — el contenedor
// relative que la envuelve en page.tsx (Cinta + Categorías + Destacados)
// es lo que le da el "recorrido" en el que puede quedar pegada; al
// terminar ese bloque, sigue el flujo normal como cualquier otra sección.
export default function CintaBeneficios() {
  return (
    <div className="sticky top-[var(--header-height,72px)] z-30 bg-primary border-y border-border-subtle py-1.5 md:py-2 overflow-hidden">
      <span className="sr-only">
        {FRASES.join(". ")}. {/* contenido real para lectores de pantalla */}
      </span>
      <div className="flex w-max animate-[marquee_28s_linear_infinite]">
        <Tanda />
        <Tanda />
      </div>
    </div>
  );
}
