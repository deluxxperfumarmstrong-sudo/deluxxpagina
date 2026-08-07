"use client";

import { useState } from "react";

export type PreguntaFrecuente = { pregunta: string; respuesta: string };

function ItemAcordeon({
  item,
  abierto,
  onToggle,
}: {
  item: PreguntaFrecuente;
  abierto: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-[var(--font-body)] font-semibold text-on-background">
          {item.pregunta}
        </span>
        <span
          className={`shrink-0 text-accent text-2xl leading-none transition-transform duration-200 ${
            abierto ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          abierto ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-on-surface-muted leading-relaxed pr-8">{item.respuesta}</p>
        </div>
      </div>
    </div>
  );
}

export default function Acordeon({ items }: { items: PreguntaFrecuente[] }) {
  const [abiertoIdx, setAbiertoIdx] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, i) => (
        <ItemAcordeon
          key={item.pregunta}
          item={item}
          abierto={abiertoIdx === i}
          onToggle={() => setAbiertoIdx(abiertoIdx === i ? null : i)}
        />
      ))}
    </div>
  );
}
