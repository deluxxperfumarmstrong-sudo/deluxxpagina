"use client";

import IconoWhatsapp from "@/components/icons/IconoWhatsapp";
import { generarLinkConsultaWhatsApp } from "@/lib/whatsapp";
import { useCarritoUI } from "@/lib/store/carritoUI";

// Acceso directo a WhatsApp, fijo en la esquina inferior derecha, presente
// en todo el sitio de cara al cliente (vive en SiteChrome, que ya excluye
// /admin). Mismo mensaje genérico que el CTA de /soporte — no el de
// checkout (generarLinkWhatsApp), que necesita el carrito armado.
//
// Círculo sólido en accent (pedido explícito, excepción puntual a la regla
// de design.md contra rounded-full): sin texto, ícono en on-accent.
export default function BotonWhatsappFlotante() {
  const carritoAbierto = useCarritoUI((s) => s.abierto);
  const toastVisible = useCarritoUI((s) => s.toastVisible);

  // Con el drawer del carrito abierto, un elemento fijo fuera del diálogo
  // quedaría igual detrás del overlay pero seguiría siendo alcanzable con
  // Tab (el drawer no implementa un focus trap real) — desmontarlo evita
  // ese hueco en vez de solo ocultarlo visualmente.
  if (carritoAbierto) return null;

  return (
    <a
      href={generarLinkConsultaWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      // El toast de "agregaste un producto" es fixed inset-x-4 bottom-4 en
      // mobile — ocupa la misma franja inferior de punta a punta durante
      // ~5s. En vez de dejar que un elemento tape al otro, este botón se
      // corre hacia arriba mientras el toast está visible y vuelve a su
      // lugar solo, con la misma cadencia de motion que el resto del sitio.
      aria-label="Escribinos por WhatsApp"
      className={`fixed z-40 right-4 md:right-6 flex items-center justify-center
        w-14 h-14 bg-accent text-on-accent rounded-full shadow-lg
        hover:brightness-110 active:scale-95
        transition-[transform,filter,bottom] duration-200 ease-out
        ${toastVisible ? "bottom-[92px] sm:bottom-4" : "bottom-4"} md:bottom-6`}
    >
      <IconoWhatsapp className="w-7 h-7 shrink-0" />
    </a>
  );
}
