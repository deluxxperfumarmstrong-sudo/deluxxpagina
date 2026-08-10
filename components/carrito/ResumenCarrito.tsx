"use client";

import { useState } from "react";
import type { ItemCarrito } from "@/lib/store/carrito";
import { totalesCarrito } from "@/lib/store/carrito";
import { formatoPrecio } from "@/lib/formato";
import { generarLinkWhatsApp } from "@/lib/whatsapp";
import { PAGOS, ENVIOS } from "@/lib/config";
import IconoWhatsapp from "@/components/icons/IconoWhatsapp";

export default function ResumenCarrito({ items }: { items: ItemCarrito[] }) {
  const { subtotal, hayEncargo, aAbonarAhora, restaPagar } = totalesCarrito(items);
  const [ubicacion, setUbicacion] = useState<"armstrong" | "otro" | null>(null);
  const [otraLocalidad, setOtraLocalidad] = useState("");

  const ubicacionValida =
    ubicacion === "armstrong" || (ubicacion === "otro" && otraLocalidad.trim().length > 0);
  const ubicacionTexto =
    ubicacion === "armstrong" ? ENVIOS.ciudadZona : otraLocalidad.trim();
  const link = generarLinkWhatsApp(items, ubicacionValida ? ubicacionTexto : undefined);

  return (
    <div className="bg-surface p-4 sm:p-6 flex flex-col gap-5">
      <h2 className="font-display text-xl text-on-surface">Resumen</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-on-surface font-display text-xl">
          <span>Total del pedido</span>
          <span>{formatoPrecio(subtotal)}</span>
        </div>

        {hayEncargo && (
          <>
            <div className="flex justify-between text-accent-text font-semibold pt-2 border-t border-border-subtle">
              <span>A abonar para realizar el pedido</span>
              <span>{formatoPrecio(aAbonarAhora)}</span>
            </div>
            <div className="flex justify-between text-on-surface-muted">
              <span>Restaría pagar</span>
              <span>{formatoPrecio(restaPagar)}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-on-surface-muted">
          ¿Desde dónde nos escribís?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setUbicacion("armstrong")}
            className={`min-h-11 px-4 text-sm rounded-full border transition-colors ${
              ubicacion === "armstrong"
                ? "border-primary bg-primary text-on-primary"
                : "border-border text-on-surface hover:border-primary"
            }`}
          >
            {ENVIOS.ciudadZona}
          </button>
          <button
            type="button"
            onClick={() => setUbicacion("otro")}
            className={`min-h-11 px-4 text-sm rounded-full border transition-colors ${
              ubicacion === "otro"
                ? "border-primary bg-primary text-on-primary"
                : "border-border text-on-surface hover:border-primary"
            }`}
          >
            Otra localidad
          </button>
        </div>
        {ubicacion === "otro" && (
          <input
            type="text"
            value={otraLocalidad}
            onChange={(e) => setOtraLocalidad(e.target.value)}
            placeholder="¿De dónde sos?"
            className="w-full bg-surface-raised text-on-surface border border-border px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-accent"
          />
        )}
      </div>

      {ubicacionValida ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
        >
          <IconoWhatsapp className="w-4 h-4" />
          Cerrar pedido por WhatsApp
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 bg-surface-raised text-on-surface-muted font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] cursor-not-allowed"
        >
          <IconoWhatsapp className="w-4 h-4" />
          Elegí tu ubicación para continuar
        </button>
      )}

      <div className="text-xs text-on-surface-muted flex flex-col gap-2 pt-4 border-t border-border-subtle">
        <p>
          <span className="text-on-surface font-semibold">Envíos:</span> {ENVIOS.ciudadZona} (
          {ENVIOS.plazoZona}), resto del país pasadas {ENVIOS.plazoResto}.
        </p>
        <p>
          <span className="text-on-surface font-semibold">Pagos:</span> {PAGOS.metodos.join(", ")}.
        </p>
      </div>
    </div>
  );
}
