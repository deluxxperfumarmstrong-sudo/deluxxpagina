"use client";

import { useEffect, useRef, useState } from "react";

// Fade + slide sutil al entrar en viewport, con IntersectionObserver —
// sin librería de animación, consistente con el resto del sitio. A pedido
// del cliente, anima siempre — no respeta prefers-reduced-motion.
export default function Reveal({
  children,
  delayMs = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sin IntersectionObserver (o si el elemento ya está en pantalla al
    // montar, ej. lo primero que se ve sin scrollear) no dependemos
    // únicamente del observer para mostrar el contenido.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const rectInicial = el.getBoundingClientRect();
    if (rectInicial.top < window.innerHeight && rectInicial.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);

    // Red de seguridad: en iOS Safari se vieron casos donde el callback del
    // observer no llega a dispararse (la barra de direcciones dinámica
    // cambia el viewport visual mientras se scrollea) y el contenido se
    // queda en opacity-0 para siempre. Pasado este tiempo se muestra igual.
    const timeoutId = window.setTimeout(() => setVisible(true), 2000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
