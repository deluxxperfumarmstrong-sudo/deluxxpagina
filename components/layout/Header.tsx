"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";
import CarritoBadge from "./CarritoBadge";
import MenuMovil from "./MenuMovil";
import { NAV_LINKS } from "@/lib/config";

export default function Header() {
  const pathname = usePathname();
  // Transparente en el tope de la página (para no tapar la animación del
  // hero) y con fondo sólido apenas se scrollea. `fixed` en vez de `sticky`
  // porque necesita superponerse al hero, no empujarlo — ver HeaderSpacer.
  const [scrolleado, setScrolleado] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolleado(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // Medido, no adivinado: el alto real del header (que cambia con el
    // breakpoint) se publica como variable CSS para que HeaderSpacer y el
    // contenido del Hero se acomoden exacto debajo del nav flotante.
    function actualizarAltura() {
      document.documentElement.style.setProperty("--header-height", `${el!.offsetHeight}px`);
    }
    actualizarAltura();

    const observer = new ResizeObserver(actualizarAltura);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolleado ? "bg-background border-b border-border-subtle" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-3 md:py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <MenuMovil />
          <Wordmark size="sm" />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const activo = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activo ? "page" : undefined}
                className={`font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide border-b transition-colors hover:text-accent ${
                  activo ? "text-on-background border-on-background" : "text-on-background border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <CarritoBadge />
      </div>
    </header>
  );
}
