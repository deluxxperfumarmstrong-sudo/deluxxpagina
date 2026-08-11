import type { Metadata } from "next";
import Link from "next/link";
import IconoLupa from "@/components/icons/IconoLupa";
import IconoEstrella from "@/components/icons/IconoEstrella";
import IconoChat from "@/components/icons/IconoChat";
import Reveal from "@/components/ui/Reveal";
import { ENVIOS } from "@/lib/config";

const MAPA_SRC = "https://www.google.com/maps?q=Armstrong,+Santa+Fe,+Argentina&output=embed";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: "La historia y los valores detrás de Deluxx Perfum.",
};

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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-10 md:gap-12 items-start mb-10 md:mb-14">
        <div>
          <Reveal>
            <h1 className="font-display text-4xl md:text-5xl text-on-background mb-4 md:mb-8 max-w-2xl">
              Perfumería para quien no se conforma con lo genérico
            </h1>
          </Reveal>

          <Reveal delayMs={70}>
            <div className="max-w-2xl flex flex-col gap-5 text-on-surface leading-relaxed text-base md:text-lg">
              <p>
                Deluxx Perfum nace para acercar perfumería árabe, de nicho y de diseñador a quien
                busca algo distinto — sin las vueltas de una perfumería tradicional. Pedido o
                stock, la decisión es tuya.
              </p>
              <p>
                Sabemos que elegir un perfume a ciegas es difícil, por eso ofrecemos muestras:
                probás antes de comprar el frasco completo. Y porque no hay dos pedidos iguales,
                cada compra se cierra hablando directamente con nosotros por WhatsApp.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Espacio para la foto del dueño — reemplazar publicId por la
            imagen real cuando esté disponible. */}
        <Reveal delayMs={110} className="w-full max-w-[220px] md:max-w-none mx-auto">
          <div className="aspect-[3/4] rounded-sm bg-surface-metallic/40 border border-border-subtle flex items-center justify-center overflow-hidden">
            <span className="font-display text-5xl text-on-surface-muted">D</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-on-surface-muted text-center mt-3">
            Fundador · Deluxx Perfum
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-14">
        {VALORES.map((v, i) => (
          <Reveal key={v.titulo} delayMs={i * 90} className="bg-surface rounded-sm p-6 flex flex-col gap-4">
            <div className="text-accent">
              <v.icono className="h-[48px] w-[48px]" />
            </div>
            <h2 className="font-display text-xl text-on-background">{v.titulo}</h2>
            <p className="text-sm text-on-surface-muted leading-relaxed">{v.texto}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mb-10 md:mb-14">
        <h2 className="font-display text-2xl md:text-3xl text-on-background mb-3">
          Dónde estamos
        </h2>
        <p className="text-on-surface-muted leading-relaxed max-w-2xl mb-5">
          Operamos desde {ENVIOS.ciudadZona}: envío {ENVIOS.plazoZona} en la zona, y al resto
          del país pasadas {ENVIOS.plazoResto}.
        </p>
        <div className="border border-border-subtle rounded-sm overflow-hidden aspect-[16/9] md:aspect-[21/9]">
          <iframe
            src={MAPA_SRC}
            title={`Ubicación de Deluxx Perfum en ${ENVIOS.ciudadZona}`}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>

      <div className="border border-border-subtle p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-on-surface">¿Tenés dudas antes de pedir? Estamos para ayudarte.</p>
        <Link
          href="/soporte"
          className="w-full text-center md:w-auto md:shrink-0 border border-accent-text text-accent-text font-[var(--font-body)] font-bold text-sm uppercase tracking-[0.08em] px-[32px] py-[16px] hover:bg-accent hover:text-on-accent hover:border-accent transition-colors"
        >
          Ir a soporte
        </Link>
      </div>
    </div>
  );
}
