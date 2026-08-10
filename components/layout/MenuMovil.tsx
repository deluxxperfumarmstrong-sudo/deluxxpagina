"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/config";
import type { CategoriaNav } from "@/lib/types";

export default function MenuMovil({ categorias }: { categorias: CategoriaNav[] }) {
  const [abierto, setAbierto] = useState(false);
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cierra con click afuera o Escape — el resto del sitio (selects,
  // acordeón) ya respeta estas convenciones de teclado, el menú móvil
  // se había quedado atrás.
  useEffect(() => {
    if (!abierto) return;

    function onPointerDown(e: PointerEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  // El submenú de Catálogo arranca cerrado cada vez que se abre el menú
  // de nuevo, en vez de recordar el estado de la vez anterior.
  useEffect(() => {
    if (!abierto) setCatalogoAbierto(false);
  }, [abierto]);

  return (
    <div className="md:hidden" ref={contenedorRef}>
      <button
        type="button"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className="relative z-50 -ml-2.5 flex w-11 h-11 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`block h-0.5 w-6 bg-on-background transition-transform ${
            abierto ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span className={`block h-0.5 w-6 bg-on-background transition-opacity ${abierto ? "opacity-0" : ""}`} />
        <span
          className={`block h-0.5 w-6 bg-on-background transition-transform ${
            abierto ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {abierto && (
        <div
          aria-hidden="true"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-30 bg-black/50"
        />
      )}

      <nav
        inert={!abierto}
        aria-hidden={!abierto}
        className={`absolute left-0 right-0 top-full z-40 bg-background border-b border-border-subtle px-4 py-2 flex flex-col origin-top transition-[opacity,transform] duration-200 ease-out ${
          abierto
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        {NAV_LINKS.map((link) => {
          const activo = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const linkClassName = `flex items-center min-h-11 py-2.5 font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide transition-colors hover:text-accent ${
            activo ? "text-accent-text" : "text-on-background"
          }`;

          // Sin categorías activas no se muestra el botón de desplegar (ver
          // el mismo criterio en Header.tsx).
          if (link.href === "/catalogo" && categorias.length > 0) {
            return (
              <div key={link.href}>
                <div className="flex items-center">
                  <Link
                    href={link.href}
                    onClick={() => setAbierto(false)}
                    aria-current={activo ? "page" : undefined}
                    className={`flex-1 ${linkClassName}`}
                  >
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCatalogoAbierto((v) => !v)}
                    aria-label={catalogoAbierto ? "Ocultar categorías" : "Mostrar categorías"}
                    aria-expanded={catalogoAbierto}
                    className="flex items-center justify-center min-w-11 min-h-11 text-on-background hover:text-accent transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${catalogoAbierto ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
                {catalogoAbierto && (
                  <div className="flex flex-col pb-1">
                    {categorias.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categoria/${cat.slug}`}
                        onClick={() => setAbierto(false)}
                        className="flex items-center min-h-11 py-2 pl-4 text-sm text-on-surface-muted hover:text-accent transition-colors"
                      >
                        {cat.nombre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setAbierto(false)}
              aria-current={activo ? "page" : undefined}
              className={linkClassName}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
