import Link from "next/link";
import { ENVIOS, PAGOS } from "@/lib/config";
import IconoCamion from "@/components/icons/IconoCamion";
import IconoBillete from "@/components/icons/IconoBillete";
import Reveal from "@/components/ui/Reveal";

export default function BloqueEnviosPagos() {
  return (
    <section className="mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Reveal className="border border-border-subtle p-6 md:p-8 flex gap-4">
          <div className="shrink-0 w-12 h-12 rounded-sm bg-surface-raised flex items-center justify-center text-accent">
            <IconoCamion className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl text-on-background mb-2">Envíos</h3>
            <p className="text-on-surface-muted text-sm leading-relaxed">
              {ENVIOS.ciudadZona}: {ENVIOS.plazoZona}. Resto del país: pasadas{" "}
              {ENVIOS.plazoResto}.
            </p>
          </div>
        </Reveal>
        <Reveal delayMs={100} className="border border-border-subtle p-6 md:p-8 flex gap-4">
          <div className="shrink-0 w-12 h-12 rounded-sm bg-surface-raised flex items-center justify-center text-accent">
            <IconoBillete className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl text-on-background mb-2">Pagos</h3>
            <p className="text-on-surface-muted text-sm leading-relaxed">
              {PAGOS.metodos.join(" · ")}. Sin pasarela de pago online — se coordina por
              WhatsApp.
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
