import Link from "next/link";
import Wordmark from "./Wordmark";
import { WHATSAPP, INSTAGRAM, SLOGAN } from "@/lib/config";
import IconoInstagram from "@/components/icons/IconoInstagram";
import IconoWhatsapp from "@/components/icons/IconoWhatsapp";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border-subtle mt-10">
      <div className="mx-auto max-w-7xl px-4 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Wordmark size="sm" />
          <p className="mt-3 font-display italic text-accent text-base">{SLOGAN}</p>
          <p className="mt-3 text-sm text-on-surface-muted max-w-xs">
            Perfumería árabe, de nicho, de diseñador y kits. Pedidos por
            encargo y en stock, cierre por WhatsApp.
          </p>
        </div>

        <div className="flex flex-col">
          <span className="text-caption uppercase tracking-widest text-on-surface-muted mb-1">
            Navegar
          </span>
          <Link href="/catalogo" className="flex items-center min-h-11 py-2 text-sm text-on-surface hover:text-accent">
            Catálogo
          </Link>
          <Link href="/muestras" className="flex items-center min-h-11 py-2 text-sm text-on-surface hover:text-accent">
            Muestras
          </Link>
          <Link href="/envios-y-pagos" className="flex items-center min-h-11 py-2 text-sm text-on-surface hover:text-accent">
            Envíos y pagos
          </Link>
          <Link href="/quienes-somos" className="flex items-center min-h-11 py-2 text-sm text-on-surface hover:text-accent">
            Quiénes somos
          </Link>
        </div>

        <div className="flex flex-col">
          <span className="text-caption uppercase tracking-widest text-on-surface-muted mb-1">
            Contacto
          </span>
          <Link href="/soporte" className="flex items-center min-h-11 py-2 text-sm text-on-surface hover:text-accent">
            Soporte
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP.numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 min-h-11 py-2 text-sm text-on-surface hover:text-accent"
          >
            <IconoWhatsapp className="w-4 h-4" />
            WhatsApp
          </a>
          <a
            href={INSTAGRAM.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 min-h-11 py-2 text-sm text-on-surface hover:text-accent"
          >
            <IconoInstagram className="w-4 h-4" />
            Instagram
          </a>
        </div>
      </div>
      <div className="border-t border-border-subtle px-4 md:px-12 py-4 text-xs text-on-surface-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <span>© {new Date().getFullYear()} Deluxx Perfum. Todos los derechos reservados.</span>
        <span>
          Desarrollado por{" "}
          <a
            href="https://justinosantos.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            Justino Santos
          </a>
        </span>
      </div>
    </footer>
  );
}
