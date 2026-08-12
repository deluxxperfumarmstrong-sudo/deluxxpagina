import type { Metadata } from "next";
import Link from "next/link";
import IconoLupa from "@/components/icons/IconoLupa";
import IconoEstrella from "@/components/icons/IconoEstrella";
import IconoChat from "@/components/icons/IconoChat";
import Reveal from "@/components/ui/Reveal";
import MapaDiferido from "@/components/quienes-somos/MapaDiferido";
import { ENVIOS } from "@/lib/config";

const CIUDAD = ENVIOS.ciudadZona;
const PROVINCIA = "Santa Fe";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: "La historia y los valores detrás de Deluxx Perfum.",
};

// Reemplazo del retrato del fundador que ocupaba la segunda columna del
// intro. La foto no era decoración: era lo único que le daba estructura a ese
// bloque (el grid [1fr_260px] existía solo para sostenerla) y el único signo
// de "quiénes somos" de la página. Sacarla y no poner nada dejaba un muro de
// texto y un hueco de confianza.
//
// Estos cuatro datos ocupan ese rol con sustancia en vez de adorno: son
// exactamente las cuatro cosas que alguien quiere saber de un negocio al que
// le va a comprar sin conocerlo. A propósito NO son datos de envío — eso ya
// vive en /envios-y-pagos y en el bloque "Dónde estamos" de más abajo, y
// repetirlo acá sería carga cognitiva sin información nueva.
const FICHA = [
  { label: "Base", valor: `${CIUDAD}, ${PROVINCIA}` },
  { label: "Catálogo", valor: "Árabe, nicho, diseñador y kits" },
  { label: "Modalidad", valor: "Stock propio y por pedido" },
  { label: "Atención", valor: "Directa, por WhatsApp" },
];

const VALORES = [
  {
    icono: IconoLupa,
    titulo: "Curaduría",
    texto:
      "Elegimos cada perfume por su calidad y su carácter, no por volumen. Árabe, de nicho o de diseñador — todo pasa el mismo filtro.",
  },
  {
    icono: IconoEstrella,
    titulo: "Calidad",
    texto:
      "Trabajamos con stock propio y productos por pedido, siempre con el mismo estándar: lo que llega a tus manos es lo que prometimos.",
  },
  {
    icono: IconoChat,
    titulo: "Atención personal",
    texto:
      "Sin carritos automáticos ni pasarelas frías. Cada pedido se cierra hablando con una persona, por WhatsApp.",
  },
];

export default function QuienesSomosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-12 py-12 md:py-16">
      {/* --- Declaración -------------------------------------------------
          Sin la foto compitiendo por el ancho, el titular puede tomar el
          tamaño "display" del sistema (~60px) en vez del h1 chico que tenía.
          En una marca cuya identidad ES la tipografía condensada del logo,
          el ancla visual más fiel es el titular mismo, no una imagen.
          text-balance reparte las líneas del titular en vez de dejar una
          palabra huérfana; text-pretty hace lo propio con los párrafos. */}
      <section className="mb-12 md:mb-16">
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-on-surface-muted">
            Quiénes somos
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[0.95] text-on-background text-balance max-w-[18ch]">
            Perfumería para quien no se conforma con lo genérico
          </h1>
          {/* Único gesto rojo de la página, del ancho de un token de spacing:
              la marca de acento que el sistema pide "rara y deliberada". */}
          <span className="mt-4 block h-1 w-12 bg-accent" aria-hidden="true" />
        </Reveal>

        {/* Dos párrafos de igual peso vuelven a leerse como bloque plano —
            que es justo lo que la foto rompía. La jerarquía la da el tamaño
            más el color (H2), no una imagen: la bajada va grande y clara, el
            segundo párrafo baja a muted. Ambos topeados en ~62-65ch. */}
        <Reveal delayMs={70}>
          <p className="mt-6 text-lg md:text-2xl leading-relaxed text-on-background text-pretty max-w-[62ch]">
            Deluxx Perfum nace para acercar perfumería árabe, de nicho y de diseñador a quien
            busca algo distinto — sin las vueltas de una perfumería tradicional. Pedido o
            stock, la decisión es tuya.
          </p>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-on-surface-muted text-pretty max-w-[65ch]">
            Sabemos que elegir un perfume a ciegas es difícil, por eso ofrecemos muestras:
            probás antes de comprar el frasco completo. Y porque no hay dos pedidos iguales,
            cada compra se cierra hablando directamente con nosotros por WhatsApp.
          </p>
        </Reveal>
      </section>

      {/* --- Ficha -------------------------------------------------------
          <dl> y no divs: son literalmente pares etiqueta/valor, y así un
          lector de pantalla los anuncia como tales.
          Los bordes van arriba+izquierda en el contenedor y derecha+abajo en
          cada celda: la grilla se ve cerrada con cualquier cantidad de
          columnas, sin reglas :last-child que se rompen al pasar de 4 a 2. */}
      <Reveal className="mb-12 md:mb-16" delayMs={110}>
        <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border-subtle">
          {FICHA.map((f) => (
            <div key={f.label} className="border-r border-b border-border-subtle p-4 md:p-6">
              <dt className="text-xs uppercase tracking-widest text-on-surface-muted">
                {f.label}
              </dt>
              <dd className="mt-2 font-[var(--font-body)] font-semibold text-on-background text-sm md:text-base text-pretty">
                {f.valor}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* --- Cómo trabajamos ---------------------------------------------
          Los títulos de las tarjetas eran <h2>, o sea hermanos de "Dónde
          estamos": el esquema de encabezados decía que "Curaduría" es una
          sección del mismo nivel que el resto de la página. Ahora el grupo
          tiene su propio <h2> y las tarjetas bajan a <h3>, que es la
          relación real. */}
      <section className="mb-12 md:mb-16" aria-labelledby="titulo-valores">
        <Reveal>
          <h2
            id="titulo-valores"
            className="font-display text-2xl md:text-3xl text-on-background mb-5 md:mb-6"
          >
            Cómo trabajamos
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALORES.map((v, i) => (
            <Reveal
              key={v.titulo}
              delayMs={i * 90}
              className="bg-surface rounded-sm p-6 flex flex-col gap-4"
            >
              <div className="text-accent">
                <v.icono className="h-[48px] w-[48px]" />
              </div>
              <h3 className="font-display text-xl text-on-background">{v.titulo}</h3>
              <p className="text-sm text-on-surface-muted leading-relaxed text-pretty">
                {v.texto}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- Dónde estamos ----------------------------------------------- */}
      <Reveal as="section" className="mb-12 md:mb-16" aria-labelledby="titulo-ubicacion">
        <h2
          id="titulo-ubicacion"
          className="font-display text-2xl md:text-3xl text-on-background mb-3"
        >
          Dónde estamos
        </h2>
        <p className="text-on-surface-muted leading-relaxed text-pretty max-w-[65ch] mb-5">
          Operamos desde {CIUDAD}: envío {ENVIOS.plazoZona} en la zona, y al resto del país
          pasadas {ENVIOS.plazoResto}.
        </p>
        <MapaDiferido
          ciudad={CIUDAD}
          provincia={PROVINCIA}
          consulta={`${CIUDAD}, ${PROVINCIA}, Argentina`}
        />
      </Reveal>

      {/* --- Cierre -------------------------------------------------------
          El final de la página era un botón outline suelto hacia soporte —
          o sea que la única salida de una página de confianza era la de
          "tengo un problema". Ahora la acción dominante es la que el negocio
          quiere (catálogo, botón sólido blanco = el token de máxima
          prioridad) y soporte queda como salida secundaria, sin desaparecer.
          En mobile los dos botones caen a ancho completo y al pie, dentro de
          la zona del pulgar. */}
      <Reveal
        as="section"
        className="border border-border-subtle bg-surface p-4 md:p-8 md:flex md:flex-row md:items-center md:justify-between md:gap-6"
        aria-labelledby="titulo-cierre"
      >
        <div>
          <h2
            id="titulo-cierre"
            className="font-display text-2xl md:text-3xl text-on-background text-balance"
          >
            Empezá por el catálogo
          </h2>
          <p className="mt-2 text-on-surface-muted leading-relaxed text-pretty max-w-[48ch]">
            Y si tenés dudas antes de pedir, escribinos: te ayudamos a elegir.
          </p>
        </div>
        {/* w-full explícito en vez de confiar en el stretch del flex: en
            mobile los dos botones ocupan todo el ancho, que es el destino más
            fácil de acertar con el pulgar (Fitts) y el patrón que ya usan el
            Hero y el resto de las páginas. */}
        <div className="mt-5 md:mt-0 flex flex-col sm:flex-row gap-3 md:shrink-0">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto text-center whitespace-nowrap bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
          >
            Ver catálogo
          </Link>
          <Link
            href="/soporte"
            className="w-full sm:w-auto text-center whitespace-nowrap border border-accent-text text-accent-text font-[var(--font-body)] font-bold text-sm uppercase tracking-[0.08em] px-[32px] py-[16px] hover:bg-accent hover:text-on-accent hover:border-accent transition-colors"
          >
            Ir a soporte
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
