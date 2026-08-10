import type { ItemCarrito } from "@/lib/store/carrito";
import { totalesCarrito } from "@/lib/store/carrito";
import { formatoPrecio } from "@/lib/formato";
import { WHATSAPP } from "@/lib/config";

export function generarMensajeWhatsApp(items: ItemCarrito[], ubicacion?: string) {
  const { subtotal, hayEncargo, aAbonarAhora, restaPagar } = totalesCarrito(items);

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
    `Total del pedido: ${formatoPrecio(subtotal)}`,
  ];

  if (hayEncargo) {
    partes.push(`A abonar para realizar el pedido: ${formatoPrecio(aAbonarAhora)}`);
    partes.push(`Restaría pagar: ${formatoPrecio(restaPagar)}`);
  }

  if (ubicacion) {
    partes.push("", `Ubicación: ${ubicacion}`);
  }

  return partes.join("\n");
}

export function generarLinkWhatsApp(items: ItemCarrito[], ubicacion?: string) {
  const mensaje = generarMensajeWhatsApp(items, ubicacion);
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensaje)}`;
}

export function generarLinkMuestraWhatsApp(nombreProducto: string) {
  const mensaje = `Hola! Quiero pedir una muestra de ${nombreProducto}.`;
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensaje)}`;
}

export function generarLinkConsultaWhatsApp() {
  const mensaje = "Hola Deluxx! Tengo la siguiente consulta: ";
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensaje)}`;
}
