"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";
import CarritoBadge from "./CarritoBadge";
import MenuMovil from "./MenuMovil";
import { NAV_LINKS } from "@/lib/config";
import type { CategoriaNav } from "@/lib/types";

export default function Header({ categorias }: { categorias: CategoriaNav[] }) {
  const pathname = usePathname();
  // Transparente en el tope de la página (para no tapar la animación del
  // hero) y con fondo sólido apenas se scrollea. `fixed` en vez de `sticky`
  // porque necesita superponerse al hero, no empujarlo — ver HeaderSpacer.
  const [scrolleado, setScrolleado] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // El evento nativo "scroll" dispara decenas de veces por segundo — sin
    // el throttle por rAF, cada uno de esos eventos corría una función JS
    // durante todo el recorrido de la página (el setState no re-renderiza
    // si el booleano no cambió, pero la función igual se ejecutaba).
    // requestAnimationFrame lo baja a como mucho una vez por frame pintado.
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolleado(window.scrollY > 8);
        ticking = false;
      });
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
      <div className="relative mx-auto max-w-7xl px-4 md:px-12 py-3 md:py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <MenuMovil categorias={categorias} />
          <Wordmark size="sm" className="hidden md:inline-block" />
        </div>
        {/* En mobile el logo va centrado de verdad, no "pegado" al
            hamburguesa — position absolute + centrado en el header entero
            así el ancho del menú y el del carrito (que cambia según la
            cantidad de ítems) no lo corren del centro real. */}
        <Wordmark size="sm" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const activo = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const linkClassName = `font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide border-b transition-colors hover:text-accent ${
              activo ? "text-on-background border-on-background" : "text-on-background border-transparent"
            }`;

            // Sin categorías activas no hay desplegable que mostrar: se
            // renderiza el link pelado, sin flecha que prometa un menú vacío.
            if (link.href === "/catalogo" && categorias.length > 0) {
              return (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    aria-current={activo ? "page" : undefined}
                    className={`${linkClassName} flex items-center gap-1`}
                  >
                    {link.label}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200 group-hover:rotate-180"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Link>
                  {/* pt-3 actúa de puente invisible: mantiene el hover activo
                      entre el link y el panel, sin dejar un hueco muerto. */}
                  <div className="absolute left-0 top-full pt-3 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                    <div className="min-w-[12rem] bg-background border border-border-subtle rounded-sm shadow-lg py-2">
                      {categorias.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categoria/${cat.slug}`}
                          className="block px-4 py-2 text-sm text-on-background hover:text-accent hover:bg-surface transition-colors"
                        >
                          {cat.nombre}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={link.href} href={link.href} aria-current={activo ? "page" : undefined} className={linkClassName}>
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
