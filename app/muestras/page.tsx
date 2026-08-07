import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Muestras",
  description: "Probá el perfume antes de comprarlo — muestras disponibles en Deluxx Perfum.",
};

export default function MuestrasPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-12 py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl text-on-background mb-6">Muestras</h1>
      <p className="text-on-surface leading-relaxed mb-4">
        Muchos de nuestros perfumes tienen muestra disponible para que puedas probarlos antes de
        decidir el tamaño y cerrar la compra. Es la forma más segura de encontrar tu fragancia,
        sobre todo en pedidos por encargo.
      </p>
      <p className="text-on-surface leading-relaxed mb-4">
        Los productos con muestra disponible tienen el badge{" "}
        <span className="inline-block bg-surface-raised text-accent-text text-xs uppercase tracking-wide rounded-full px-3 py-1 border border-accent-text align-middle">
          Muestra disponible
        </span>{" "}
        en el catálogo y en su ficha.
      </p>
      <p className="text-on-surface leading-relaxed mb-8">
        Para pedir una muestra, escribinos por WhatsApp indicando el perfume que te interesa.
      </p>
      <Link
        href="/catalogo"
        className="inline-block bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#E8E8E8] transition-colors"
      >
        Ver catálogo
      </Link>
    </div>
  );
}
