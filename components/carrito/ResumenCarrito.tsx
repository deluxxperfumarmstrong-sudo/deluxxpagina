import type { ItemCarrito } from "@/lib/store/carrito";
import { totalesCarrito } from "@/lib/store/carrito";
import { formatoPrecio } from "@/lib/formato";
import { generarLinkWhatsApp } from "@/lib/whatsapp";
import { PAGOS, ENVIOS } from "@/lib/config";

export default function ResumenCarrito({ items }: { items: ItemCarrito[] }) {
  const { subtotal, senaTotal } = totalesCarrito(items);
  const link = generarLinkWhatsApp(items);

  return (
    <div className="bg-surface p-4 sm:p-6 flex flex-col gap-5">
      <h2 className="font-display text-xl text-on-surface">Resumen</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-on-surface-muted">
          <span>Subtotal</span>
          <span>{formatoPrecio(subtotal)}</span>
        </div>
        {senaTotal > 0 && (
          <div className="flex justify-between text-accent-text font-semibold">
            <span>Seña total a abonar</span>
            <span>{formatoPrecio(senaTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-on-surface font-display text-xl pt-2 border-t border-border-subtle">
          <span>Total</span>
          <span>{formatoPrecio(subtotal)}</span>
        </div>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
      >
        Cerrar pedido por WhatsApp
      </a>

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
