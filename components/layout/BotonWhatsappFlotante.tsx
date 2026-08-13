"use client";

import IconoWhatsapp from "@/components/icons/IconoWhatsapp";
import { generarLinkConsultaWhatsApp } from "@/lib/whatsapp";
import { useCarritoUI } from "@/lib/store/carritoUI";

// Acceso directo a WhatsApp, fijo en la esquina inferior derecha, presente
// en todo el sitio de cara al cliente (vive en SiteChrome, que ya excluye
// /admin). Mismo mensaje genérico que el CTA de /soporte — no el de
// checkout (generarLinkWhatsApp), que necesita el carrito armado.
//
// A propósito NO es un círculo verde de WhatsApp: design.md prohíbe
// explícitamente redondear botones ("rounded.full... never used on primary
// surfaces or buttons") y un segundo color de acento. Se arma con el
// vocabulario que el sistema ya define para esto — button-accent
// (transparente, borde y texto en accent-text, se llena de accent solo en
// hover) — que es exactamente el tratamiento que ya usan todos los demás
// links de WhatsApp del sitio (Footer, FichaProducto, soporte). Esquina
// recta (rounded-sm, "el único lugar donde se permite un poco de
// suavidad" según el sistema), sin sombra (profundidad por borde + tono,
// no por shadow).
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
      className={`fixed z-40 right-4 md:right-6 flex items-center gap-2
        bg-surface-raised border border-accent-text text-accent-text
        rounded-sm px-[14px] py-[14px] md:pr-[20px]
        hover:bg-accent hover:border-accent hover:text-on-accent
        active:scale-95 transition-[background-color,border-color,color,transform,bottom]
        duration-200 ease-out
        ${toastVisible ? "bottom-[92px] sm:bottom-4" : "bottom-4"} md:bottom-6`}
    >
      <IconoWhatsapp className="w-[26px] h-[26px] shrink-0" />
      {/* sr-only en vez de hidden: el nombre accesible del link es el mismo
          texto visible en desktop, no un aria-label aparte — así coincide
          con lo que un usuario de control por voz diría para activarlo
          (WCAG 2.5.3), tanto en mobile (donde el texto no se ve) como en
          desktop (donde sí). */}
      <span className="sr-only md:not-sr-only font-[var(--font-body)] font-bold text-xs uppercase tracking-[0.08em] whitespace-nowrap">
        Escribinos
      </span>
    </a>
  );
}
