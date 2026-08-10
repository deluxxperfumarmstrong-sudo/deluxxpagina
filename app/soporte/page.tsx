import type { Metadata } from "next";
import { ENVIOS, PAGOS, MILILITROS_VALIDOS } from "@/lib/config";
import Acordeon, { type PreguntaFrecuente } from "@/components/soporte/Acordeon";
import IconoWhatsapp from "@/components/icons/IconoWhatsapp";
import { generarLinkConsultaWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Soporte",
  description: "Preguntas frecuentes sobre pedidos, envíos y pagos en Deluxx Perfum.",
};

const PREGUNTAS: PreguntaFrecuente[] = [
  {
    pregunta: "¿Cómo hago un pedido?",
    respuesta:
      "Elegís el perfume y el tamaño en el catálogo, lo agregás al carrito y cerrás el pedido por WhatsApp. Ahí coordinamos envío y pago.",
  },
  {
    pregunta: "¿Qué diferencia hay entre \"por encargo\" y \"en stock\"?",
    respuesta:
      "Los productos en stock los tenemos ya disponibles. Los que son por encargo se piden especialmente para vos, y llevan una seña del 50% del total para confirmar el pedido.",
  },
  {
    pregunta: "¿Puedo probar el perfume antes de comprarlo?",
    respuesta:
      "Sí, muchos perfumes tienen muestra disponible — se indica con el badge \"Muestra disponible\" en el catálogo y en la ficha del producto.",
  },
  {
    pregunta: "¿Qué tamaños hay disponibles?",
    respuesta: `Según el perfume, elegís entre ${MILILITROS_VALIDOS.join(", ")} ml.`,
  },
  {
    pregunta: "¿Cuánto tarda el envío?",
    respuesta: `En ${ENVIOS.ciudadZona} el envío es ${ENVIOS.plazoZona}. Al resto del país llega pasadas ${ENVIOS.plazoResto}.`,
  },
  {
    pregunta: "¿Cómo puedo pagar?",
    respuesta: `Aceptamos ${PAGOS.metodos.join(", ")}. No hay pasarela de pago online — todo se coordina por WhatsApp.`,
  },
  {
    pregunta: "Tengo otra duda, ¿cómo los contacto?",
    respuesta: "Escribinos directo por WhatsApp, te respondemos ahí mismo.",
  },
];

export default function SoportePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-12 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl text-on-background mb-4">Soporte</h1>
      <p className="text-on-surface-muted mb-10 max-w-lg">
        Las dudas más comunes antes de pedir. Si no encontrás lo que buscás, escribinos
        directo.
      </p>

      <Acordeon items={PREGUNTAS} />

      <div className="mt-12 bg-surface rounded-sm p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-on-background mb-1">
            ¿No encontraste tu respuesta?
          </h2>
          <p className="text-sm text-on-surface-muted">
            Escribinos por WhatsApp y te ayudamos directo.
          </p>
        </div>
        <a
          href={generarLinkConsultaWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 md:w-auto md:shrink-0 bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
        >
          <IconoWhatsapp className="w-4 h-4" />
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}
