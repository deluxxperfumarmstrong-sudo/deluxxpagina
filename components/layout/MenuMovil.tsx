"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/config";

export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="md:hidden" ref={contenedorRef}>
      <button
        type="button"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className="relative z-50 flex flex-col gap-1.5 w-6 p-1"
      >
        <span
          className={`block h-0.5 bg-on-background transition-transform ${
            abierto ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span className={`block h-0.5 bg-on-background transition-opacity ${abierto ? "opacity-0" : ""}`} />
        <span
          className={`block h-0.5 bg-on-background transition-transform ${
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
        className={`absolute left-0 right-0 top-full z-40 bg-background border-b border-border-subtle px-6 py-6 flex flex-col gap-5 origin-top transition-[opacity,transform] duration-200 ease-out ${
          abierto
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setAbierto(false)}
            className="font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide text-on-background hover:text-accent transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
