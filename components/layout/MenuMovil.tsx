"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/config";

export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className="flex flex-col gap-1.5 w-6 p-1"
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
        <nav className="absolute left-0 right-0 top-full bg-background border-b border-border-subtle px-6 py-6 flex flex-col gap-5">
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
      )}
    </div>
  );
}
