import type { Metadata } from "next";
import Link from "next/link";
import IconoLupa from "@/components/icons/IconoLupa";
import IconoEstrella from "@/components/icons/IconoEstrella";
import IconoChat from "@/components/icons/IconoChat";
import Reveal from "@/components/ui/Reveal";

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
      "Trabajamos con stock propio y pedidos por encargo, siempre con el mismo estándar: lo que llega a tus manos es lo que prometimos.",
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
      <h1 className="font-display text-4xl md:text-5xl text-on-background mb-8 max-w-2xl">
        Perfumería para quien no se conforma con lo genérico
      </h1>

      <div className="max-w-2xl flex flex-col gap-5 text-on-surface leading-relaxed text-base md:text-lg mb-10 md:mb-14">
        <p>
          Deluxx Perfum nace para acercar perfumería árabe, de nicho y de diseñador a quien
          busca algo distinto — sin las vueltas de una perfumería tradicional. Encargo o stock,
          la decisión es tuya.
        </p>
        <p>
          Sabemos que elegir un perfume a ciegas es difícil, por eso ofrecemos muestras: probás
          antes de comprar el frasco completo. Y porque no hay dos pedidos iguales, cada compra
          se cierra hablando directamente con nosotros por WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-14">
        {VALORES.map((v, i) => (
          <Reveal key={v.titulo} delayMs={i * 90} className="bg-surface rounded-sm p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-sm bg-surface-raised flex items-center justify-center text-accent">
              <v.icono className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl text-on-background">{v.titulo}</h2>
            <p className="text-sm text-on-surface-muted leading-relaxed">{v.texto}</p>
          </Reveal>
        ))}
      </div>

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
