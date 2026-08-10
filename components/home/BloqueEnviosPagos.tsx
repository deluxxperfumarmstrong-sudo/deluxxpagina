import Link from "next/link";
import { ENVIOS, PAGOS } from "@/lib/config";
import IconoCamion from "@/components/icons/IconoCamion";
import IconoBillete from "@/components/icons/IconoBillete";
import Reveal from "@/components/ui/Reveal";

export default function BloqueEnviosPagos() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-12 py-10 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Reveal className="border border-border-subtle p-6 md:p-8 flex gap-4">
          <div className="shrink-0 text-accent">
            <IconoCamion className="h-16 w-16" />
          </div>
          <div>
            <h3 className="font-display text-3xl md:text-4xl text-on-background mb-3">Envíos</h3>
            <p className="text-on-surface-muted text-lg md:text-xl leading-relaxed">
              {ENVIOS.ciudadZona}: {ENVIOS.plazoZona}.
            </p>
            <p className="text-on-surface-muted text-base md:text-lg leading-relaxed mt-1">
              Resto del país: pasadas {ENVIOS.plazoResto}.
            </p>
          </div>
        </Reveal>
        <Reveal delayMs={100} className="border border-border-subtle p-6 md:p-8 flex gap-4">
          <div className="shrink-0 text-accent">
            <IconoBillete className="h-16 w-16" />
          </div>
          <div>
            <h3 className="font-display text-3xl md:text-4xl text-on-background mb-3">Pagos</h3>
            <p className="text-on-surface-muted text-lg md:text-xl leading-relaxed">
              {PAGOS.metodos.join(" · ")}.
            </p>
            <p className="text-on-surface-muted text-base md:text-lg leading-relaxed mt-1">
              Sin pasarela de pago online — se coordina por WhatsApp.
            </p>
          </div>
        </Reveal>
      </div>
      <div className="mt-6">
        <Link href="/envios-y-pagos" className="text-sm text-accent-text hover:underline">
          Ver todos los detalles →
        </Link>
      </div>
    </section>
  );
}
