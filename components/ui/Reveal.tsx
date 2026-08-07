"use client";

import { useEffect, useRef, useState } from "react";

// Fade + slide sutil al entrar en viewport, con IntersectionObserver —
// sin librería de animación, consistente con el resto del sitio. Respeta
// prefers-reduced-motion (motion-reduce: sin transform, aparece directo).
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
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 motion-safe:translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
