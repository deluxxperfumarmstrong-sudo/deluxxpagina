import Link from "next/link";
import Wordmark from "./Wordmark";
import { WHATSAPP } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border-subtle mt-10">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Wordmark size="sm" />
          <p className="mt-4 text-sm text-on-surface-muted max-w-xs">
            Perfumería árabe, de nicho, de diseñador y kits. Pedidos por
            encargo y en stock, cierre por WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-caption uppercase tracking-widest text-on-surface-muted mb-2">
            Navegar
          </span>
          <Link href="/catalogo" className="text-sm text-on-surface hover:text-accent">
            Catálogo
          </Link>
          <Link href="/muestras" className="text-sm text-on-surface hover:text-accent">
            Muestras
          </Link>
          <Link href="/envios-y-pagos" className="text-sm text-on-surface hover:text-accent">
            Envíos y pagos
          </Link>
          <Link href="/quienes-somos" className="text-sm text-on-surface hover:text-accent">
            Quiénes somos
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-caption uppercase tracking-widest text-on-surface-muted mb-2">
            Contacto
          </span>
          <Link href="/soporte" className="text-sm text-on-surface hover:text-accent">
            Soporte
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP.numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-on-surface hover:text-accent"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-border-subtle px-6 md:px-12 py-4 text-xs text-on-surface-muted">
        © {new Date().getFullYear()} Deluxx Perfum. Todos los derechos reservados.
      </div>
    </footer>
  );
}
