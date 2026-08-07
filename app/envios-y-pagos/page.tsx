import type { Metadata } from "next";
import { ENVIOS, PAGOS } from "@/lib/config";
import IconoCamion from "@/components/icons/IconoCamion";
import IconoBillete from "@/components/icons/IconoBillete";
import IconoReloj from "@/components/icons/IconoReloj";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Envíos y pagos",
  description: "Cómo llega tu pedido y cómo pagarlo en Deluxx Perfum.",
};

const NOTA_METODO: Record<string, string> = {
  "Transferencia bancaria": "los datos se comparten al cerrar el pedido por WhatsApp.",
  Dólares: PAGOS.notaCotizacionUsd,
  Efectivo: "coordinamos el pago al momento de la entrega.",
};

export default function EnviosYPagosPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 md:px-12 py-12 md:py-16">
      <p className="text-caption uppercase tracking-widest text-accent mb-3">
        Cómo comprar
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-on-background mb-12 md:mb-16">
        Envíos y pagos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Envíos */}
        <Reveal as="section" className="bg-surface rounded-sm p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center text-accent">
              <IconoCamion className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl text-on-background">Envíos</h2>
          </div>

          <div className="border border-accent bg-surface-raised p-4 flex items-start gap-3">
            <IconoReloj className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-on-surface leading-relaxed">
              <span className="text-primary font-semibold">{ENVIOS.ciudadZona}</span>: pedido
              hecho hoy, entregado {ENVIOS.plazoZona}.
            </p>
          </div>

          <div className="border border-border-subtle p-4 flex items-start gap-3">
            <IconoReloj className="w-5 h-5 text-on-surface-muted mt-0.5 shrink-0" />
            <p className="text-on-surface leading-relaxed">
              <span className="text-primary font-semibold">Resto del país:</span> el envío sale
              pasadas {ENVIOS.plazoResto}.
            </p>
          </div>

          <p className="text-sm text-on-surface-muted">
            El costo y la empresa de envío se coordinan por WhatsApp al cerrar el pedido, según
            tu ubicación.
          </p>
        </Reveal>

        {/* Pagos */}
        <Reveal
          as="section"
          delayMs={100}
          className="bg-surface rounded-sm p-6 md:p-8 flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center text-accent">
              <IconoBillete className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl text-on-background">Pagos</h2>
          </div>

          <ul className="flex flex-col gap-3">
            {PAGOS.metodos.map((metodo) => (
              <li
                key={metodo}
                className="border border-border-subtle p-4 flex flex-col gap-1"
              >
                <span className="text-primary font-semibold">{metodo}</span>
                <span className="text-sm text-on-surface-muted leading-relaxed">
                  {NOTA_METODO[metodo]}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-sm text-on-surface-muted">
            Deluxx Perfum no tiene pasarela de pago online: todo pedido se confirma por
            WhatsApp antes de coordinar el pago.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
