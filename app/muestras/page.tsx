import type { Metadata } from "next";
import Link from "next/link";
import IconoLupa from "@/components/icons/IconoLupa";
import IconoChat from "@/components/icons/IconoChat";
import IconoEstrella from "@/components/icons/IconoEstrella";
import Reveal from "@/components/ui/Reveal";
import { BadgeTipo, BadgeMuestra } from "@/components/producto/Badges";

export const metadata: Metadata = {
  title: "Muestras",
  description: "Probá el perfume antes de comprarlo — muestras disponibles en Deluxx Perfum.",
};

const PASOS = [
  {
    icono: IconoLupa,
    titulo: "Elegís el perfume",
    texto: "Buscá en el catálogo los productos con el badge \"Muestra disponible\".",
  },
  {
    icono: IconoChat,
    titulo: "Pedís por WhatsApp",
    texto: "Nos escribís indicando qué perfume te interesa probar.",
  },
  {
    icono: IconoEstrella,
    titulo: "Probás y decidís",
    texto: "Con la muestra en mano, elegís tamaño y cerrás la compra del frasco completo.",
  },
];

export default function MuestrasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-12 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10 md:gap-12 items-start mb-12 md:mb-16">
        <div>
          <Reveal>
            <h1 className="font-display text-4xl md:text-5xl text-on-background mb-6">
              Muestras
            </h1>
          </Reveal>
          <Reveal delayMs={70}>
            <p className="text-on-surface leading-relaxed text-base md:text-lg mb-4">
              Muchos de nuestros perfumes tienen muestra disponible para que puedas probarlos
              antes de decidir el tamaño y cerrar la compra. Es la forma más segura de encontrar
              tu fragancia, sobre todo en pedidos por encargo.
            </p>
            <p className="text-on-surface leading-relaxed text-base md:text-lg mb-4 md:mb-8">
              Los productos con muestra disponible se identifican con este badge en el catálogo y
              en su ficha:
            </p>
          </Reveal>
          <Reveal delayMs={120}>
            <Link
              href="/catalogo"
              className="inline-block bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
            >
              Ver catálogo
            </Link>
          </Reveal>
        </div>

        {/* Demo real de tarjeta de producto — mismas clases y los mismos
            componentes de badge que ProductCard, así se ve exactamente como
            en el catálogo. El ancho en mobile replica el de una tarjeta real
            de la grilla de 2 columnas (ver GrillaProductos: px-4 de margen +
            gap-3 entre columnas), no un card suelto más grande — es lo que
            el usuario realmente va a ver en su celular. */}
        <Reveal
          delayMs={90}
          className="w-full max-w-[calc((100vw-2rem-0.75rem)/2)] sm:max-w-[220px] md:max-w-none mx-auto"
        >
          <div className="bg-surface rounded-sm p-2 sm:p-4">
            <div className="relative aspect-square mb-2 sm:mb-4 overflow-hidden">
              <div className="absolute inset-0 bg-surface-metallic/40 border border-border-subtle flex items-center justify-center">
                <span className="font-display text-4xl text-on-surface-muted">D</span>
              </div>
              <div className="absolute top-2 left-2">
                <BadgeTipo tipo="ENCARGO" compacto />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-1">Árabe</p>
            <h3 className="font-display text-xl text-on-surface leading-tight">
              Ej: Yasmine Al Sham
            </h3>
            <div className="mt-2 mb-1">
              <BadgeMuestra compacto />
            </div>
            <p className="font-[var(--font-body)] font-semibold text-primary text-sm mt-2">
              $ 23.800
            </p>
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 md:mb-14">
        {PASOS.map((p, i) => (
          <Reveal key={p.titulo} delayMs={i * 90} className="bg-surface rounded-sm p-6 flex flex-col gap-4">
            <div className="text-accent">
              <p.icono className="h-[40px] w-[40px]" />
            </div>
            <h2 className="font-display text-lg text-on-background">{p.titulo}</h2>
            <p className="text-sm text-on-surface-muted leading-relaxed">{p.texto}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
