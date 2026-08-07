import type { ItemCarrito } from "@/lib/store/carrito";
import { totalesCarrito } from "@/lib/store/carrito";
import { formatoPrecio } from "@/lib/formato";
import { WHATSAPP } from "@/lib/config";

export function generarMensajeWhatsApp(items: ItemCarrito[]) {
  const { subtotal, senaTotal } = totalesCarrito(items);

  const lineas = items.map((i) => {
    const subtotalLinea = i.precioUnitario * i.cantidad;
    const senaLinea = i.senaUnitaria * i.cantidad;
    const senaTag = i.tieneSena ? `  [ENCARGO · seña ${formatoPrecio(senaLinea)}]` : "";
    return `• ${i.nombre} — ${i.ml}ml × ${i.cantidad} — ${formatoPrecio(subtotalLinea)}${senaTag}`;
  });

  const partes = [
    "Hola Deluxx! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total: ${formatoPrecio(subtotal)}`,
  ];

  if (senaTotal > 0) {
    partes.push(`Seña a abonar: ${formatoPrecio(senaTotal)}`);
  }

  return partes.join("\n");
}

export function generarLinkWhatsApp(items: ItemCarrito[]) {
  const mensaje = generarMensajeWhatsApp(items);
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensaje)}`;
}
